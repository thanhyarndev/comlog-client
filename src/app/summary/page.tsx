'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpenseTransactionsByFilter } from '@/hooks/api/expenseTransaction';
import { getEmployees } from '@/hooks/api/employee';
import type { ExpenseTransaction } from '@/types/transaction';
import type { Employee } from '@/types/employee';
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
} from 'recharts';
import { format } from 'date-fns';

export default function WeeklySummaryPage() {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [txs, emps] = await Promise.all([
        getExpenseTransactionsByFilter(),
        getEmployees(),
      ]);
      setTransactions(txs);
      setEmployees(emps);
    };
    fetchData();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.alias || emp?.name || 'Unknown';
  };

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalReceived = transactions.reduce((sum, tx) => sum + tx.receivedAmount, 0);
  const totalDebt = totalAmount - totalReceived;

  const allEmployeeIds = Array.from(new Set(transactions.map(tx => tx.employeeId)));

  const debtPerPerson = Object.entries(
    transactions.reduce((acc, tx) => {
      acc[tx.employeeId] = (acc[tx.employeeId] || 0) + (tx.amount - tx.receivedAmount);
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([id, debt]) => ({
      name: getEmployeeName(id),
      debt,
    }))
    .filter(item => item.debt > 0)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 5);

  const pieData = [
    { name: 'Đã thu', value: totalReceived },
    { name: 'Chưa thu', value: totalDebt },
  ];

  const pieColors = ['#22c55e', '#f97316'];

  const groupedByEmployee = transactions.reduce((acc, tx) => {
    const key = tx.employeeId;
    if (!acc[key]) acc[key] = { total: 0, received: 0 };
    acc[key].total += tx.amount;
    acc[key].received += tx.receivedAmount;
    return acc;
  }, {} as Record<string, { total: number; received: number }>);

  const employeesWithDebts = Object.entries(groupedByEmployee)
    .map(([id, data]) => ({
      id,
      name: getEmployeeName(id),
      total: data.total,
      received: data.received,
      debt: data.total - data.received,
    }));

  const debtors = employeesWithDebts.filter(e => e.debt > 0);
  const paidFull = employeesWithDebts.filter(e => e.debt <= 0);

  const dates = transactions.map(tx => tx.createdAt).filter(Boolean) as string[];
const latestDate = dates.length > 0
  ? format(new Date(Math.max(...dates.map(d => new Date(d).getTime()))), 'dd/MM/yyyy')
  : '-';

  return (
    <div className="space-y-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold mb-4">📊 Tổng hợp Chi phí trong tuần</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tổng chi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-700">{totalAmount.toLocaleString()} ₫</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Đã thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-600">{totalReceived.toLocaleString()} ₫</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Còn lại</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-red-600">{totalDebt.toLocaleString()} ₫</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tổng số giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{transactions.length} lượt</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{latestDate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🧾 Top 5 người còn nợ</CardTitle>
          </CardHeader>
          <CardContent>
            {debtPerPerson.length === 0 ? (
              <p className="text-muted-foreground italic">Tất cả đã thanh toán.</p>
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Tỉ lệ thu tiền</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📌 Danh sách người còn nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {debtors.map((p, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{p.name}</span>
                  <span>{p.debt.toLocaleString()} ₫</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✔️ Đã thanh toán đủ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-green-600">
              {paidFull.length === 0 ? (
                <li className="text-muted-foreground italic">Chưa có ai thanh toán đủ</li>
              ) : (
                paidFull.map((p, idx) => <li key={idx}>✔ {p.name}</li>)
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}