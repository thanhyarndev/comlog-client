"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateExpenseTransaction } from "@/hooks/api/expenseTransaction";
import type { ExpenseTransaction } from "@/types/transaction";

type EmployeeStat = {
  id: string;
  name: string;
  total: number;
  received: number;
  debt: number;
  status: string;
};

type Props = {
  employeeStats: EmployeeStat[];
  transactions: ExpenseTransaction[];
  refresh: () => void;
  getExpenseTitle: (expenseId: string) => string;
  getExpenseDate: (expenseId: string) => string | undefined;
};

export default function PaymentStatus({
  employeeStats,
  transactions,
  refresh,
  getExpenseTitle,
  getExpenseDate,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleToggle = async (tx: ExpenseTransaction) => {
    const isPaid = tx.status === "paid";
    await updateExpenseTransaction(tx._id, {
      status: isPaid ? "unpaid" : "paid",
      receivedAmount: isPaid ? 0 : tx.amount,
    });
    refresh();
  };

  const handlePayAll = async (empId: string) => {
    const pending = transactions.filter(
      (t) => t.employeeId === empId && t.status !== "paid"
    );
    await Promise.all(
      pending.map((t) =>
        updateExpenseTransaction(t._id, {
          status: "paid",
          receivedAmount: t.amount,
        })
      )
    );
    refresh();
  };

  const stats = employeeStats.find((e) => e.id === selectedId) || null;
  const empTxs = selectedId
    ? transactions.filter((t) => t.employeeId === selectedId)
    : [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>📋 Trạng thái thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Nhân viên
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium">
                    Tổng
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium">
                    Đã trả
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium">
                    Còn nợ
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeeStats.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedId(emp.id)}
                  >
                    <td className="px-4 py-3 text-sm">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {emp.total.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {emp.received.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {emp.debt.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-3 text-sm text-center capitalize">
                      {emp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <DialogContent className="max-w-5xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {stats ? `Chi tiết của ${stats.name}` : "Chi tiết thanh toán"}
            </DialogTitle>
          </DialogHeader>

          {stats && (
            <div className="grid grid-cols-5 gap-4 mt-2 mb-4 text-center">
              {[
                { label: "Nhân viên", value: stats.name },
                { label: "Tổng", value: `${stats.total.toLocaleString()} ₫` },
                {
                  label: "Đã trả",
                  value: `${stats.received.toLocaleString()} ₫`,
                },
                {
                  label: "Còn nợ",
                  value: `${stats.debt.toLocaleString()} ₫`,
                  className: "text-red-600",
                },
                {
                  label: "Trạng thái",
                  value: stats.status,
                  className: "capitalize",
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <span className="block text-sm font-medium">
                    {item.label}
                  </span>
                  <span
                    className={`block mt-1 text-base font-semibold ${
                      item.className || ""
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {stats && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => handlePayAll(stats.id)}
                variant="secondary"
              >
                Thanh toán tất cả
              </Button>
            </div>
          )}

          {stats && (
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-sm font-medium">
                        Nội dung
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-medium">
                        Ngày
                      </th>
                      <th className="px-3 py-2 text-right text-sm font-medium">
                        Chi phí
                      </th>
                      <th className="px-3 py-2 text-center text-sm font-medium">
                        Trạng thái
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-medium">
                        Ghi chú
                      </th>
                      <th className="px-3 py-2 text-center text-sm font-medium">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {empTxs.map((tx) => (
                      <tr key={tx._id}>
                        <td className="px-3 py-2 text-sm">
                          {getExpenseTitle(tx.expenseId)}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {(() => {
                            const dateStr = getExpenseDate(tx.expenseId);
                            if (!dateStr) return "-";
                            const d = new Date(dateStr);
                            return isNaN(d.getTime())
                              ? "-"
                              : format(d, "dd/MM/yyyy");
                          })()}
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          {tx.amount.toLocaleString()} ₫
                        </td>
                        <td className="px-3 py-2 text-sm text-center capitalize">
                          {tx.status}
                        </td>
                        <td className="px-3 py-2 text-sm">{tx.note || "-"}</td>
                        <td className="px-3 py-2 text-center">
                          <Switch
                            checked={tx.status === "paid"}
                            onCheckedChange={() => handleToggle(tx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
