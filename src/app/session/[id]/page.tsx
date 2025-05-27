// src/app/session/[id]/page.tsx
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

// Hàm bỏ dấu để so sánh
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
  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const sessionId = Array.isArray(id) ? id[0] : id;
    getSessionById(sessionId).then((s) => {
      setSession(s);
      if (!s.isActive) setSessionExpired(true);
    });
    getEmployees().then(setEmployees);
    getFoodItems().then(setFoodItems);
  }, [id]);

  // Filter nhân viên theo search
  const filteredEmployees = employees.filter((e) => {
    const kw = removeAccents(employeeSearch.trim());
    return (
      removeAccents(e.name).includes(kw) ||
      removeAccents(e.alias || "").includes(kw)
    );
  });

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!session || !selectedEmployee || selectedItems.length === 0) return;

    const note = selectedItems.join(" + ");
    const amount = selectedItems.reduce((sum, name) => {
      const f = foodItems.find((fi) => fi.name === name);
      return sum + (f?.price || 0);
    }, 0);

    setIsSubmitting(true);
    try {
      const existing = await getExpenseTransactionsByFilter({
        expenseId: session.expenseId,
        employeeId: selectedEmployee,
      });
      if (existing.length > 0) {
        await updateExpenseTransaction(existing[0]._id, { amount, note });
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
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi ghi nhận!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dữ liệu hiển thị
  const selectedDetails = selectedItems
    .map((name) => {
      const f = foodItems.find((fi) => fi.name === name);
      return f ? `${f.name} (${f.price.toLocaleString()}₫)` : name;
    })
    .join(" + ");
  const total = selectedItems.reduce((sum, name) => {
    const f = foodItems.find((fi) => fi.name === name);
    return sum + (f?.price || 0);
  }, 0);

  const mainDishes = session?.items.filter((item) =>
    foodItems.some((f) => f.name === item && f.type === "main")
  );
  const sideDishes = session?.items.filter((item) =>
    foodItems.some((f) => f.name === item && f.type === "side")
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

      {/* Phần chọn nhân viên */}
      <div className="space-y-2 relative">
        <label className="font-medium block mb-1">Bạn là ai?</label>
        {!selectedEmployee && (
          <p className="text-sm text-red-500">Vui lòng chọn nhân viên.</p>
        )}
        <input
          type="text"
          className="w-full border rounded px-3 py-2 focus:outline-none"
          placeholder="Nhập tên hoặc alias nhân viên..."
          value={
            selectedEmployee
              ? employees.find((e) => e.id === selectedEmployee)?.name || ""
              : employeeSearch
          }
          onChange={(e) => {
            setEmployeeSearch(e.target.value);
            setSelectedEmployee("");
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Đợi một chút trước khi đóng để onClick chọn kịp chạy
            setTimeout(() => setShowDropdown(false), 150);
          }}
        />
        {showDropdown && (
          <ul className="absolute z-10 w-full bg-white border mt-1 max-h-60 overflow-y-auto">
            {filteredEmployees.map((e) => (
              <li
                key={e.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedEmployee(e.id);
                  setEmployeeSearch(e.name);
                  setShowDropdown(false);
                }}
              >
                <span className="font-medium">{e.name}</span>
                {e.alias && (
                  <span className="text-sm text-gray-500"> ({e.alias})</span>
                )}
              </li>
            ))}
            {filteredEmployees.length === 0 && (
              <li className="px-4 py-2 text-gray-500">Không tìm thấy</li>
            )}
          </ul>
        )}
      </div>

      {/* Phần chọn món */}
      {session && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-2">Món chính</h2>
            <div className="flex flex-wrap gap-2">
              {mainDishes?.map((item) => {
                const sel = selectedItems.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleItem(item)}
                    className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                      sel
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
                const sel = selectedItems.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleItem(item)}
                    className={`cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all ${
                      sel
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

      {/* Thông tin đã chọn */}
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
          !selectedEmployee || selectedItems.length === 0 || isSubmitting
        }
        className="bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? "Đang lưu..." : "Xác nhận chọn món"}
      </Button>
    </div>
  );
}
