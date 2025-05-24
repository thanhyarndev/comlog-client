"use client";

import React, { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExpenseForm from "@/components/ExpensesForm";
import {
  createExpense,
  createExpenseTransaction,
  deleteExpense,
  getAllExpenses,
  getExpensesByDateRange,
  toggleExpenseCollected,
} from "@/hooks/api/expense";
import {
  getExpenseTransactionsByFilter,
  updateExpenseTransaction,
  deleteExpenseTransaction,
  getTransactionsByExpenseIds,
} from "@/hooks/api/expenseTransaction";
import { getEmployees } from "@/hooks/api/employee";
import type { Expense } from "@/types/expense";
import type { ExpenseItem, Employee } from "@/types/employee";
import type { ExpenseTransaction } from "@/types/transaction";
import { useRouter } from "next/navigation";
import { deactivateSession, getSessionById } from "@/hooks/api/session";

export default function ExpensesPage() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [allTransactions, setAllTransactions] = useState<ExpenseTransaction[]>(
    []
  );

  const now = new Date();
  const router = useRouter();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "dd/MM/yyyy");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "dd/MM/yyyy");

  const [editedRows, setEditedRows] = useState<{ [id: string]: boolean }>({});
  const [startDate, setStartDate] = useState(
    startOfWeek(now, { weekStartsOn: 1 })
  );
  const [endDate, setEndDate] = useState(endOfWeek(now, { weekStartsOn: 1 }));

  const [selectedSession, setSelectedSession] = useState<{
    _id: string;
    isActive: boolean;
  } | null>(null);

  const loadExpenses = async () => {
    const from = format(startDate, "yyyy-MM-dd");
    const to = format(endDate, "yyyy-MM-dd");

    const data = await getExpensesByDateRange(from, to);
    setExpenses(data);
  };

  console.log("selectedSession: ", selectedSession);

  const loadEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const loadAllTransactions = async () => {
    const ids = expenses.map((e) => e._id);
    const txs = await getTransactionsByExpenseIds(ids);
    setAllTransactions(txs);
  };

  const loadTransactions = async (expenseId: string) => {
    const data = await getExpenseTransactionsByFilter({ expenseId });
    setTransactions(data.map((tx) => ({ ...tx })));
    setSelectedExpenseId(expenseId);
    setShowModal(true);

    // 🧠 Dùng hàm chuẩn thay vì fetch cứng
    const expense = expenses.find((e) => e._id === expenseId);
    if (expense?.isSessionBased && expense.sessionId) {
      try {
        const session = await getSessionById(expense.sessionId);
        setSelectedSession(session);
      } catch (err) {
        console.error("Không thể tải session:", err);
        setSelectedSession(null);
      }
    } else {
      setSelectedSession(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadEmployees();
      loadExpenses().then(() => {
        console.log("🔍 Expenses:", expenses);
      });
    };
    load();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      loadAllTransactions();
    }
  }, [expenses]);

  useEffect(() => {
    loadExpenses();
  }, [startDate, endDate]);

  const handleFormSubmit = async (data: {
    title: string;
    date: string;
    notes?: string;
    employees: ExpenseItem[];
  }) => {
    setShowExpenseForm(false);
    await loadExpenses();
    await loadAllTransactions();
  };

  const handleToggleTransactionStatus = async (tx: ExpenseTransaction) => {
    const isPaid = tx.status === "paid";
    await updateExpenseTransaction(tx._id, {
      receivedAmount: isPaid ? 0 : tx.amount,
      status: isPaid ? "unpaid" : "paid",
    });
    if (selectedExpenseId) await loadTransactions(selectedExpenseId);
    await loadExpenses();
    await loadAllTransactions();
  };

  const handleEdit = (
    idx: number,
    field: keyof ExpenseTransaction,
    value: any
  ) => {
    setTransactions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });

    const id = transactions[idx]._id || idx.toString();
    setEditedRows((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleSave = async (tx: ExpenseTransaction, idx: number) => {
    try {
      if (tx._id) {
        // Cập nhật giao dịch đã tồn tại
        await updateExpenseTransaction(tx._id, {
          amount: tx.amount,
          receivedAmount: tx.status === "paid" ? tx.amount : 0,
          status: tx.status,
        });
      } else {
        // Tạo giao dịch mới
        await createExpenseTransaction({
          expenseId: typeof tx.expenseId === "string" ? tx.expenseId : "",
          employeeId: tx.employeeId,
          amount: tx.amount,
          receivedAmount: tx.status === "paid" ? tx.amount : 0,
          status: tx.status,
        });
      }

      // Xóa đánh dấu dòng đã chỉnh
      setEditedRows((prev) => {
        const copy = { ...prev };
        delete copy[tx._id || idx.toString()];
        return copy;
      });

      // Reload lại dữ liệu
      await loadTransactions(selectedExpenseId!);
      await loadExpenses();
    } catch (error) {
      console.error("Lỗi khi lưu transaction:", error);
      alert("Có lỗi xảy ra khi lưu giao dịch. Vui lòng thử lại.");
    }
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp?.alias || emp?.name || id;
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý Chi phí Ăn trưa
        </h1>
        <p className="text-muted-foreground">
          Theo dõi chi phí ăn trưa của nhân viên và tổng hợp hàng tuần
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const prevStart = new Date(startDate);
              prevStart.setDate(prevStart.getDate() - 7);
              setStartDate(startOfWeek(prevStart, { weekStartsOn: 1 }));
              setEndDate(endOfWeek(prevStart, { weekStartsOn: 1 }));
            }}
          >
            ← Tuần trước
          </Button>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">
              {format(startDate, "dd/MM/yyyy")} -{" "}
              {format(endDate, "dd/MM/yyyy")}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              const nextStart = new Date(startDate);
              nextStart.setDate(nextStart.getDate() + 7);
              setStartDate(startOfWeek(nextStart, { weekStartsOn: 1 }));
              setEndDate(endOfWeek(nextStart, { weekStartsOn: 1 }));
            }}
          >
            Tuần sau →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowExpenseForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm chi phí
          </Button>

          <Button variant="outline" onClick={() => router.push("/session/new")}>
            🍱 Tạo session chọn món
          </Button>
        </div>
      </div>

      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Thêm chi phí ăn trưa mới</DialogTitle>
            <CardDescription>
              Nhập thông tin chi phí ăn trưa của nhân viên
            </CardDescription>
          </DialogHeader>
          <div className="mt-4">
            <ExpenseForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowExpenseForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu chi</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Ngày</th>
                <th className="px-4 py-2 text-left">Tiêu đề</th>
                <th className="px-4 py-2 text-left">Ghi chú</th>
                <th className="px-4 py-2 text-right">Tổng</th>
                <th className="px-4 py-2 text-right">Đã thu</th>
                <th className="px-4 py-2 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const relatedTx = allTransactions.filter(
                  (tx) => String(tx.expenseId) === String(e._id)
                );

                const total = relatedTx.reduce((sum, tx) => sum + tx.amount, 0);
                const received = relatedTx.reduce(
                  (sum, tx) => sum + tx.receivedAmount,
                  0
                );

                return (
                  <tr key={e._id} className="border-t">
                    <td className="px-4 py-2">
                      {format(new Date(e.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span>{e.title}</span>
                        {e.isSessionBased && e.sessionId && (
                          <a
                            href={`/session/${e.sessionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            🔗 Xem session
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">{e.notes || "-"}</td>
                    <td className="px-4 py-2 text-right">
                      {total.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-2 text-right">
                      {received.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadTransactions(e._id)}
                      >
                        Xem
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] overflow-auto">
            {selectedSession && (
              <div className="flex items-center justify-between px-2 py-2 border rounded bg-gray-50 mb-3">
                <div className="text-sm text-muted-foreground">
                  Session này đang{" "}
                  <span className="font-semibold text-black">
                    {selectedSession.isActive ? "MỞ" : "ĐÃ ĐÓNG"}
                  </span>
                  . Bạn có thể khóa/mở lại để chặn nhân viên đặt món.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Mở</span>
                  <Switch
                    checked={selectedSession.isActive}
                    onCheckedChange={async (checked) => {
                      await deactivateSession(selectedSession._id, checked);
                      setSelectedSession((prev) =>
                        prev ? { ...prev, isActive: checked } : prev
                      );
                    }}
                  />
                </div>
              </div>
            )}

            <table className="w-full table-auto border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Nhân viên</th>
                  <th className="px-4 py-2 text-left">Nội dung</th>{" "}
                  {/* ✅ NEW */}
                  <th className="px-4 py-2 text-right">Phải thu</th>
                  <th className="px-4 py-2 text-right">Đã thu</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const isNew = !tx._id;
                  const isEditingNew = isNew && !tx.employeeId;
                  const rowKey = tx._id || idx.toString();

                  return (
                    <tr key={rowKey} className="border-t">
                      <td className="px-4 py-2">
                        {isEditingNew ? (
                          <select
                            value={tx.employeeId || ""}
                            onChange={(e) =>
                              handleEdit(idx, "employeeId", e.target.value)
                            }
                            className="border px-2 py-1 rounded w-full"
                          >
                            <option value="" disabled>
                              Chọn nhân viên
                            </option>
                            {employees
                              .filter(
                                (emp) =>
                                  !transactions.some(
                                    (t, tIdx) =>
                                      t.employeeId === emp.id && tIdx !== idx
                                  )
                              )
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.alias || emp.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          getEmployeeName(tx.employeeId)
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 max-w-xs">
                        {tx.note || "-"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          className="text-right border px-2 py-1 rounded w-24"
                          value={tx.amount}
                          onChange={(e) =>
                            handleEdit(
                              idx,
                              "amount",
                              parseInt(e.target.value || "0")
                            )
                          }
                          disabled={isEditingNew && !tx.employeeId}
                        />
                      </td>

                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          className="text-right border px-2 py-1 rounded w-24"
                          value={tx.receivedAmount}
                          onChange={(e) =>
                            handleEdit(
                              idx,
                              "receivedAmount",
                              parseInt(e.target.value || "0")
                            )
                          }
                          disabled={isEditingNew && !tx.employeeId}
                        />
                      </td>

                      <td className="px-4 py-2 text-center">
                        <Switch
                          checked={tx.status === "paid"}
                          onCheckedChange={(checked) => {
                            handleEdit(
                              idx,
                              "status",
                              checked ? "paid" : "unpaid"
                            );
                            handleEdit(
                              idx,
                              "receivedAmount",
                              checked ? tx.amount : 0
                            );
                          }}
                          disabled={isEditingNew && !tx.employeeId}
                        />
                      </td>

                      <td className="px-4 py-2 text-center space-x-2">
                        {editedRows[rowKey] && (
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handleSave(tx, idx)}
                          >
                            Lưu
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (tx._id) {
                              await deleteExpenseTransaction(tx._id);
                              await loadTransactions(selectedExpenseId!);
                              await loadExpenses();
                            } else {
                              const updated = [...transactions];
                              updated.splice(idx, 1);
                              setTransactions(updated);
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Button
              variant="outline"
              disabled={
                employees.length ===
                transactions.filter((t) => t.employeeId).length
              }
              onClick={() => {
                const availableEmployees = employees.filter(
                  (emp) => !transactions.some((t) => t.employeeId === emp.id)
                );
                if (availableEmployees.length > 0) {
                  setTransactions((prev) => [
                    ...prev,
                    {
                      _id: "",
                      employeeId: "",
                      expenseId: selectedExpenseId!,
                      amount: 0,
                      receivedAmount: 0,
                      status: "unpaid",
                    },
                  ]);
                }
              }}
            >
              + Thêm chi phí
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
