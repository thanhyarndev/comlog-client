"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getExpenseTransactionsByFilter,
  updateExpenseTransaction,
} from "@/hooks/api/expenseTransaction";
import { getEmployees } from "@/hooks/api/employee";
import { getAllExpenses } from "@/hooks/api/expense";
import type { ExpenseTransaction } from "@/types/transaction";
import type { Employee } from "@/types/employee";
import type { Expense } from "@/types/expense";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// --- Summary Cards Component ---
function SummaryCards({
  totalAmount,
  totalReceived,
  totalDebt,
  txCount,
  latestDate,
}: {
  totalAmount: number;
  totalReceived: number;
  totalDebt: number;
  txCount: number;
  latestDate: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
      {[
        { title: "Tổng chi", value: totalAmount, color: "text-green-700" },
        { title: "Đã thu", value: totalReceived, color: "text-blue-600" },
        { title: "Còn lại", value: totalDebt, color: "text-red-600" },
      ].map((card, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-semibold ${card.color}`}>
              {card.value.toLocaleString()} ₫
            </p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>Tổng giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{txCount} lượt</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{latestDate}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- ChartSection Component ---
function ChartSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <TopDebtChart />
      </Card>
      <Card>
        <RevenuePieChart />
      </Card>
    </div>
  );
}

// --- Top Debt Chart ---
function TopDebtChart() {
  const { debtPerPerson } = React.useContext(AppContext);
  return (
    <>
      <CardHeader>
        <CardTitle>🧾 Top 5 người còn nợ</CardTitle>
      </CardHeader>
      <CardContent>
        {debtPerPerson.length === 0 ? (
          <p className="italic text-muted-foreground">Tất cả đã thanh toán.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={debtPerPerson}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
              <Bar dataKey="debt" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </>
  );
}

// --- Revenue Pie Chart ---
function RevenuePieChart() {
  const { pieData, pieColors } = React.useContext(AppContext);
  return (
    <>
      <CardHeader>
        <CardTitle>🎯 Tỷ lệ thu tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              dataKey="value"
            >
              {pieData.map((_entry: any, idx: number) => (
                <Cell key={idx} fill={pieColors[idx]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}

// --- Daily Line Chart ---
function DailyLineChart() {
  const { dailyData } = React.useContext(AppContext);
  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Chi tiêu theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// --- Top Collectors Chart ---
function TopCollectorsChart() {
  const { topCollectors } = React.useContext(AppContext);
  return (
    <Card>
      <CardHeader>
        <CardTitle>🌟 Top collectors</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCollectors}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
            <Bar dataKey="received" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

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

// --- PaymentStatus Component with expandable details ---
function PaymentStatus({
  employeeStats,
  transactions,
  refresh,
  getExpenseTitle,
  getExpenseDate,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
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
  console.log("empTxs", empTxs);

  return (
    <>
      {/* Bảng tổng hợp ngoài modal */}
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

      {/* Modal chi tiết giao dịch */}
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

          {/* Thông tin tổng hợp nhân viên */}
          {stats && (
            <div className="grid grid-cols-5 gap-4 mt-2 mb-4 text-center">
              <div>
                <span className="block text-sm font-medium">Nhân viên</span>
                <span className="block mt-1 text-base font-semibold">
                  {stats.name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium">Tổng</span>
                <span className="block mt-1 text-base font-semibold">
                  {stats.total.toLocaleString()} ₫
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium">Đã trả</span>
                <span className="block mt-1 text-base font-semibold">
                  {stats.received.toLocaleString()} ₫
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium">Còn nợ</span>
                <span className="block mt-1 text-base font-semibold text-red-600">
                  {stats.debt.toLocaleString()} ₫
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium">Trạng thái</span>
                <span className="block mt-1 text-base font-semibold capitalize">
                  {stats.status}
                </span>
              </div>
            </div>
          )}

          {/* Nút thanh toán tất cả */}
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

          {/* Bảng chi tiết: cuộn được khi dài */}
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

// --- ExpenseTotals Component ---
function ExpenseTotals({
  expenseTotals,
}: {
  expenseTotals: { title: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💼 Tổng tiền theo khoản mục</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Khoản mục</th>
              <th className="px-4 py-2 text-right">Tổng chi</th>
            </tr>
          </thead>
          <tbody>
            {expenseTotals.map((exp, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{exp.title}</td>
                <td className="px-4 py-2 text-right">
                  {exp.total.toLocaleString()} ₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// --- Context to share computed data ---
const AppContext = React.createContext<any>(null);

export default function WeeklySummaryPage() {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const [txs, emps, exps] = await Promise.all([
        getExpenseTransactionsByFilter(),
        getEmployees(),
        getAllExpenses(),
      ]);
      setTransactions(txs);
      setEmployees(emps);
      setExpenses(exps);
    }
    fetchAll();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(
      (e) => (e as any)._id === id || (e as any).id === id
    );
    return emp?.alias || emp?.name || "Unknown";
  };
  const getExpenseTitle = (id: string) => {
    const exp = expenses.find((e) => (e as any)._id === id);
    return exp?.title || "Unknown";
  };

  // Trả về chuỗi ISO gốc hoặc undefined nếu không tìm thấy
  const getExpenseDate = (id: string): string | undefined => {
    const exp = expenses.find((e) => (e as any)._id === id);
    return exp?.date as string | undefined;
  };

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalReceived = transactions.reduce(
    (sum, tx) => sum + tx.receivedAmount,
    0
  );
  const totalDebt = totalAmount - totalReceived;
  const latestDate =
    transactions.length > 0
      ? format(
          new Date(
            Math.max(
              ...transactions
                .filter((tx) => tx.createdAt !== undefined)
                .map((tx) => new Date(tx.createdAt as string).getTime())
            )
          ),
          "dd/MM/yyyy"
        )
      : "-";

  const debtPerPerson = Object.entries(
    transactions.reduce((acc, tx) => {
      acc[tx.employeeId] =
        (acc[tx.employeeId] || 0) + (tx.amount - tx.receivedAmount);
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([id, debt]) => ({ name: getEmployeeName(id), debt }))
    .filter((item) => item.debt > 0)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 5);

  const pieData = [
    { name: "Đã thu", value: totalReceived },
    { name: "Chưa thu", value: totalDebt },
  ];
  const pieColors = ["#22c55e", "#f97316"];

  const dailyData = Object.entries(
    transactions.reduce((acc, tx) => {
      const day = format(new Date(tx.createdAt ?? 0), "dd/MM");
      acc[day] = (acc[day] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => {
      const [dA, mA] = a.date.split("/").map(Number);
      const [dB, mB] = b.date.split("/").map(Number);
      return mA !== mB ? mA - mB : dA - dB;
    });

  const topCollectors = Object.entries(
    transactions.reduce((acc, tx) => {
      acc[tx.employeeId] = (acc[tx.employeeId] || 0) + tx.receivedAmount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([id, received]) => ({ name: getEmployeeName(id), received }))
    .sort((a, b) => b.received - a.received)
    .slice(0, 5);

  const expenseTotals = Object.entries(
    transactions.reduce((acc, tx) => {
      acc[tx.expenseId] = (acc[tx.expenseId] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([id, total]) => ({ title: getExpenseTitle(id), total }))
    .sort((a, b) => b.total - a.total);

  const groupedByEmployee = transactions.reduce((acc, tx) => {
    if (!acc[tx.employeeId]) acc[tx.employeeId] = { total: 0, received: 0 };
    acc[tx.employeeId].total += tx.amount;
    acc[tx.employeeId].received += tx.receivedAmount;
    return acc;
  }, {} as Record<string, { total: number; received: number }>);

  const employeeStats = Object.entries(groupedByEmployee).map(([id, data]) => ({
    id,
    name: getEmployeeName(id),
    total: data.total,
    received: data.received,
    debt: data.total - data.received,
    status:
      data.received === 0
        ? "unpaid"
        : data.received < data.total
        ? "partial"
        : "paid",
  }));

  const refresh = () => {
    getExpenseTransactionsByFilter().then(setTransactions);
  };

  return (
    <AppContext.Provider
      value={{ debtPerPerson, pieData, pieColors, dailyData, topCollectors }}
    >
      <div className="space-y-6 px-4 md:px-8">
        <h2 className="text-2xl font-bold">📊 Tổng hợp Chi phí trong tuần</h2>
        <SummaryCards
          totalAmount={totalAmount}
          totalReceived={totalReceived}
          totalDebt={totalDebt}
          txCount={transactions.length}
          latestDate={latestDate}
        />
        <ChartSection />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <DailyLineChart />
          <TopCollectorsChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <PaymentStatus
            employeeStats={employeeStats}
            transactions={transactions}
            refresh={refresh}
            getExpenseTitle={getExpenseTitle}
            getExpenseDate={getExpenseDate}
          />
          <ExpenseTotals expenseTotals={expenseTotals} />
        </div>
      </div>
    </AppContext.Provider>
  );
}
