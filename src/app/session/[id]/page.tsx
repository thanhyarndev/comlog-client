"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSessionById } from "@/hooks/api/session";
import { getEmployees } from "@/hooks/api/employee";
import { getFoodItems } from "@/hooks/api/foodItem";
import {
  createExpenseTransaction,
  getExpenseTransactionsByFilter,
  updateExpenseTransaction,
} from "@/hooks/api/expenseTransaction";
import type { FoodItem } from "@/types/foodItem";
import type { Session } from "@/types/session";
import type { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmployeeAutocomplete from "@/components/EmployeeCombobox";

const removeAccents = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);


  useEffect(() => {
    if (id) {
      getSessionById(id as string).then((s) => {
        setSession(s);
        if (!s.isActive) setSessionExpired(true);
      });
      getEmployees().then(setEmployees);
      getFoodItems().then(setFoodItems);
    }
    
  }, [id]);

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || selectedItems.length === 0 || !session) return;

    const note = selectedItems.join(" + ");
    const amount = selectedItems.reduce((total, item) => {
      const found = foodItems.find((f) => f.name === item);
      return total + (found?.price || 0);
    }, 0);

    setIsSubmitting(true);
    try {
      const existing = await getExpenseTransactionsByFilter({
        expenseId: session.expenseId,
        employeeId: selectedEmployee,
      });

      if (existing.length > 0) {
        await updateExpenseTransaction(existing[0]._id, {
          amount,
          note,
        });
      } else {
        await createExpenseTransaction({
          expenseId: session.expenseId,
          employeeId: selectedEmployee,
          amount,
          note,
          receivedAmount: 0,
          status: "unpaid",
        });
      }

      alert("Ghi nhận thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi ghi nhận!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDetails = selectedItems
    .map((name) => {
      const item = foodItems.find((f) => f.name === name);
      return item ? `${item.name} (${item.price.toLocaleString()}₫)` : name;
    })
    .join(" + ");

  const total = selectedItems.reduce((sum, name) => {
    const item = foodItems.find((f) => f.name === name);
    return sum + (item?.price || 0);
  }, 0);

  const filteredEmployees = employees.filter((e) => {
    const keyword = removeAccents(employeeSearch);
    return (
      removeAccents(e.name).includes(keyword) ||
      removeAccents(e.alias || "").includes(keyword)
    );
  });

  const mainDishes = session?.items.filter((item) =>
    foodItems.find((f) => f.name === item && f.type === "main")
  );
  const sideDishes = session?.items.filter((item) =>
    foodItems.find((f) => f.name === item && f.type === "side")
  );

  if (sessionExpired) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Phiên đặt cơm đã kết thúc
        </h1>
        <p className="mt-4 text-gray-600">
          Session này không còn hoạt động nữa. Vui lòng liên hệ quản trị viên
          nếu cần mở lại.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Chọn Món Ăn</h1>

      <div className="space-y-4">
        <div>
          <label className="font-medium block mb-1">Bạn là ai?</label>
          {!selectedEmployee && (
            <p className="text-sm text-red-500 mt-1">
              Vui lòng chọn nhân viên.
            </p>
          )}
          <EmployeeAutocomplete
            employees={employees}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
          />
        </div>

        {session && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-2">Món chính</h2>
              <div className="flex flex-wrap gap-2">
                {mainDishes?.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => toggleItem(item)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                        isSelected
                          ? "bg-pink-100 border-pink-500 text-pink-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Món phụ</h2>
              <div className="flex flex-wrap gap-2">
                {sideDishes?.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => toggleItem(item)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                        isSelected
                          ? "bg-pink-100 border-pink-500 text-pink-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {selectedItems.length > 0 && (
          <div className="bg-gray-100 p-4 rounded space-y-2">
            <div>
              <strong>Nội dung:</strong> {selectedDetails}
            </div>
            <div>
              <strong>Giá tham khảo:</strong> {total.toLocaleString()}₫
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            !selectedEmployee?.trim() ||
            selectedItems.length === 0 ||
            isSubmitting
          }
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Đang lưu..." : "Xác nhận chọn món"}
        </Button>
      </div>
    </div>
  );
}
