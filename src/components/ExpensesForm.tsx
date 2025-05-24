// ✅ src/components/ExpenseForm.tsx — cập nhật UI: thêm tiêu đề, di chuyển ngày xuống, bỏ mô tả chung
"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Employee, ExpenseItem } from "@/types/employee";
import { getEmployees } from "@/hooks/api/employee";
import { createExpense, createExpenseTransaction } from "@/hooks/api/expense";
import { createTag, getAllTags } from "@/hooks/api/tag";
import TagSelector from "./TagSelector";

interface Props {
  onSubmit: (expense: {
    title: string;
    date: string;
    employees: ExpenseItem[];
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ onSubmit, onCancel }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [selection, setSelection] = useState<
    Record<string, { amount: number; note?: string }>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [defaultAmount, setDefaultAmount] = useState<number>(10000);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .finally(() => setLoading(false));
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const res = await getAllTags();
    setTags(res.map((tag: { name: any }) => tag.name));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const tag = await createTag({ name: newTag.trim() });
    const name = tag.name;
    const updatedTags = [...selectedTags, name];
    setTags((prev) => [...prev, name]);
    setSelectedTags(updatedTags);
    setTitle(updatedTags.join(", "));
    setNewTag("");
  };

  const toggleEmployee = (id: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        // Đưa người mới chọn lên đầu
        const reordered = { [id]: { amount: defaultAmount }, ...next };
        return reordered;
      }
      return next;
    });
  };

  const updateAmount = (id: string, value: string) => {
    const amt = parseInt(value, 10) || 0;
    setSelection((prev) => ({ ...prev, [id]: { ...prev[id], amount: amt } }));
  };

  const updateNote = (id: string, value: string) => {
    setSelection((prev) => ({ ...prev, [id]: { ...prev[id], note: value } }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!date) newErrors.date = "Vui lòng chọn ngày";
    if (Object.keys(selection).length === 0)
      newErrors.employees = "Chọn ít nhất một nhân viên";
    if (Object.values(selection).some((v) => v.amount <= 0))
      newErrors.amount = "Số tiền phải lớn hơn 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const employeesSelected: ExpenseItem[] = Object.entries(selection).map(
      ([id, info]) => {
        const emp = employees.find((e) => e.id === id)!;
        return {
          id,
          name: emp.name,
          amount: info.amount,
          note: info.note,
        };
      }
    );

    try {
      // 1. Tạo expense (bỏ totalAmount, totalReceived)
      const expense = await createExpense({
        title,
        date: format(date, "yyyy-MM-dd"),
        notes, // thêm ghi chú chung vào đây
      });

      // 2. Tạo các transaction
      await Promise.all(
        employeesSelected.map((emp) =>
          createExpenseTransaction({
            expenseId: expense._id,
            employeeId: emp.id,
            amount: emp.amount,
            note: emp.note,
            receivedAmount: 0,
            status: "unpaid",
          })
        )
      );

      // 3. Callback nếu thành công
      onSubmit({
        title,
        date: format(date, "yyyy-MM-dd"),
        employees: employeesSelected,
      });
    } catch (err) {
      console.error("Lỗi khi tạo chi phí:", err);
      alert("Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại.");
    }
  };

  const total = Object.values(selection).reduce((a, b) => a + b.amount, 0);
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Đang tải danh sách nhân viên...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="space-y-2 md:col-span-6 lg:col-span-6">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            placeholder="VD: Ăn trưa thứ Hai tại Quán ABC"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="date">Ngày</Label>
          <Input
            type="date"
            id="date"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const newDate = e.target.value
                ? new Date(e.target.value)
                : new Date();
              if (!isNaN(newDate.getTime())) {
                setDate(newDate);
              }
            }}
            className="w-full"
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label>Số tiền mặc định</Label>
          <Input
            type="number"
            value={defaultAmount}
            onChange={(e) => setDefaultAmount(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <TagSelector
        selectedTags={selectedTags}
        onChange={(updated) => {
          setSelectedTags(updated);
          setTitle(updated.join(", "));
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú chung</Label>
        <Textarea
          id="notes"
          placeholder="Ghi chú cho phiếu chi..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Nhân viên</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Tìm kiếm theo tên"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {filteredEmployees.map((emp) => {
            const isSelected = emp.id in selection;
            return (
              <div
                key={emp.id}
                onClick={() => toggleEmployee(emp.id)}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-full border cursor-pointer text-sm transition",
                  isSelected
                    ? "bg-pink-100 border-pink-500 text-pink-800"
                    : "bg-blue-100 border-blue-400 text-blue-800"
                )}
              >
                <span className="mr-1">
                  {emp.gender === "male" ? "👨" : "👩"}
                </span>
                <span>{emp.name}</span>
                {isSelected && (
                  <X
                    className="ml-1 h-3 w-3 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEmployee(emp.id);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {errors.employees && (
          <p className="text-sm text-red-500">{errors.employees}</p>
        )}
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount}</p>
        )}
        <div className="text-sm text-right text-muted-foreground mt-1">
          Tổng: {total.toLocaleString()} ₫
        </div>
      </div>

      {Object.keys(selection).length > 0 && (
        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
          {Object.entries(selection).map(([id, info]) => {
            const emp = employees.find((e) => e.id === id)!;
            return (
              <div
                key={id}
                className="flex flex-col gap-2 border rounded-lg p-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">💵 {emp.name}</span>
                  <Input
                    type="number"
                    className="w-32 text-right"
                    value={info.amount}
                    onChange={(e) => updateAmount(id, e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder={`Ghi chú cho ${emp.name}...`}
                  value={info.note || ""}
                  onChange={(e) => updateNote(id, e.target.value)}
                  className="text-sm"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Lưu
        </Button>
      </div>
    </form>
  );
}
