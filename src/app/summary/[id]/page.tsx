"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getExpenseTransactionsByFilter } from "@/hooks/api/expenseTransaction";
import type { ExpenseTransaction } from "@/types/transaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function EmployeeSummaryPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"week" | "all">("week");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    if (!id) return;
    getExpenseTransactionsByFilter({ employeeId: id as string })
      .then((data) => setTransactions(data))
      .finally(() => setIsLoading(false));
  }, [id]);

  const startOfCurrentWeek = useMemo(
    () => dayjs().startOf("week").add(currentWeekOffset, "week"),
    [currentWeekOffset]
  );
  const endOfCurrentWeek = startOfCurrentWeek.endOf("week");

  const filteredTransactions = useMemo(() => {
    if (viewMode === "all") return transactions;
    return transactions.filter((t) => {
      const date = dayjs((t.expenseId as any).date);
      return (
        date.isSameOrAfter(startOfCurrentWeek) &&
        date.isSameOrBefore(endOfCurrentWeek)
      );
    });
  }, [transactions, startOfCurrentWeek, endOfCurrentWeek, viewMode]);

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalPaid = filteredTransactions.reduce(
    (sum, t) => sum + t.receivedAmount,
    0
  );
  const totalUnpaid = totalAmount - totalPaid;
  const unpaidCount = filteredTransactions.filter(
    (t) => t.status === "unpaid"
  ).length;

  const pieData = [
    { name: "Đã trả", value: totalPaid },
    { name: "Chưa trả", value: totalUnpaid },
  ];

  const lineData = filteredTransactions
    .map((t) => ({
      name: dayjs((t.expenseId as any).date).format("DD/MM"),
      amount: t.amount,
    }))
    .reverse();

  const formatStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600 text-white">Đã trả</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500 text-black">Trả thiếu</Badge>;
      case "unpaid":
      default:
        return <Badge className="bg-red-600 text-white">Chưa trả</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">📊 Tổng quan chi tiêu cá nhân</h1>

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-x-2">
          <button
            onClick={() => setViewMode("week")}
            className={`border rounded px-3 py-1 ${
              viewMode === "week" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            Theo tuần
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`border rounded px-3 py-1 ${
              viewMode === "all" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            Toàn bộ
          </button>
        </div>
        {viewMode === "week" && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentWeekOffset((w) => w - 1)}
              className="border rounded px-3 py-1"
            >
              ← Tuần trước
            </button>
            <div className="text-center font-semibold">
              {startOfCurrentWeek.format("DD/MM/YYYY")} -{" "}
              {endOfCurrentWeek.format("DD/MM/YYYY")}
            </div>
            <button
              onClick={() => setCurrentWeekOffset((w) => w + 1)}
              className="border rounded px-3 py-1"
            >
              Tuần sau →
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-600">
              {totalAmount.toLocaleString()}đ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-600">
              {totalPaid.toLocaleString()}đ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Còn nợ ({unpaidCount} lần)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-red-600">
              {totalUnpaid.toLocaleString()}đ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Tỉ lệ thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Diễn tiến chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📅 Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>
                    {new Date((tx.expenseId as any).date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{(tx.expenseId as any).title}</TableCell>
                  <TableCell>{tx.note || "-"}</TableCell>
                  <TableCell className="text-right">
                    {tx.amount.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.receivedAmount.toLocaleString()}đ
                  </TableCell>
                  <TableCell>{formatStatusBadge(tx.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
