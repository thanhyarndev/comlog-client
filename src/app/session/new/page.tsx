"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createExpense, createSessionWithExpense } from "@/hooks/api/expense";
import {
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from "@/hooks/api/foodItem";
import { createSession } from "@/hooks/api/session";
import type { FoodItem } from "@/types/foodItem";
import { getAllTags } from "@/hooks/api/tag";
import TagSelector from "@/components/TagSelector";

const removeAccents = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function CreateSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);
  const mainItems = foodItems.filter((item) => item.type === "main");
  const sideItems = foodItems.filter((item) => item.type === "side");
  const [newType, setNewType] = useState<"main" | "side">("main");

  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadItems();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const res = await getAllTags();
    setTags(res.map((tag: { name: any }) => tag.name));
  };

  const loadItems = async () => {
    const data = await getFoodItems();
    setFoodItems(data);
  };

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!title || !date || selectedItems.length === 0) {
      alert("Vui lòng nhập đủ thông tin và chọn ít nhất 1 món ăn");
      return;
    }

    setLoading(true);
    try {
      const session = await createSessionWithExpense({
        title,
        date: format(date, "yyyy-MM-dd"),
        items: selectedItems,
        tagIds: selectedTags, // ✅ gửi thêm tagIds
      });

      alert("Tạo session thành công!");
      router.push(`/session/${session._id}`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo session, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleAddFood = async () => {
    console.log("Adding food item:", newItem, newPrice, newType);

    if (!newItem || newPrice < 0) return;
    await createFoodItem({ name: newItem, price: newPrice, type: newType });
    setNewItem("");
    setNewPrice(0);
    setNewType("main"); // reset
    await loadItems();
  };

  const handleDeleteFood = async (id: string) => {
    await deleteFoodItem(id);
    await loadItems();
  };

  const handleUpdateFood = async (id: string, price: number) => {
    await updateFoodItem(id, { price });
    await loadItems();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tạo Session Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                placeholder="VD: Ăn trưa thứ 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TagSelector
                selectedTags={selectedTags}
                onChange={(updated) => {
                  setSelectedTags(updated);
                  setTitle(updated.join(", "));
                }}
              />
            </div>

            <div className="col-span-4 space-y-2">
              <Label>Ngày</Label>
              <Input
                type="text"
                value={format(date, "dd/MM/yyyy")}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) setDate(newDate);
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-4">
              {/* Món chính */}
              <div>
                <Label>Món chính</Label>
                <Input
                  placeholder="Tìm món chính..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full mt-1"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {mainItems
                    .filter((item) =>
                      removeAccents(item.name).includes(
                        removeAccents(searchTerm)
                      )
                    )
                    .map((item) => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <div
                          key={item._id}
                          onClick={() => toggleItem(item.name)}
                          className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                            isSelected
                              ? "bg-pink-100 border-pink-500 text-pink-800"
                              : "bg-gray-100 border-gray-300 text-gray-700"
                          }`}
                        >
                          {item.name} ({item.price.toLocaleString()}₫)
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Món phụ */}
              <div>
                <Label>Món phụ</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sideItems.map((item) => {
                    const isSelected = selectedItems.includes(item.name);
                    return (
                      <div
                        key={item._id}
                        onClick={() => toggleItem(item.name)}
                        className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                          isSelected
                            ? "bg-pink-100 border-pink-500 text-pink-800"
                            : "bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        {item.name} ({item.price.toLocaleString()}₫)
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMenuDialog(true)}
            >
              Quản lý Menu
            </Button>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo Session"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quản lý Món Ăn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tên món ăn"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Giá"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "main" | "side")}
                className="border rounded px-2 py-1"
              >
                <option value="main">Món chính</option>
                <option value="side">Món phụ</option>
              </select>
              <Button onClick={handleAddFood}>Thêm</Button>
            </div>
            <div className="space-y-6">
              {/* Món chính */}
              <div>
                <h4 className="font-semibold mb-2">Món chính</h4>
                <div className="space-y-2">
                  {foodItems
                    .filter((item) => item.type === "main")
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.price.toLocaleString()}₫
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            defaultValue={item.price}
                            onBlur={(e) =>
                              handleUpdateFood(item._id, Number(e.target.value))
                            }
                            className="w-24"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFood(item._id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Món phụ */}
              <div>
                <h4 className="font-semibold mb-2">Món phụ</h4>
                <div className="space-y-2">
                  {foodItems
                    .filter((item) => item.type === "side")
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.price.toLocaleString()}₫
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            defaultValue={item.price}
                            onBlur={(e) =>
                              handleUpdateFood(item._id, Number(e.target.value))
                            }
                            className="w-24"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFood(item._id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
