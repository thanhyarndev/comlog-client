"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getExpenseTransactionsByFilter } from "@/hooks/api/expenseTransaction";
import { getEmployees } from "@/hooks/api/employee";
import { getAllExpenses } from "@/hooks/api/expense";
import type { ExpenseTransaction } from "@/types/transaction";
import type { Employee } from "@/types/employee";
import type { Expense } from "@/types/expense";

import SummaryCards from "@/components/summary/SummaryCards";
import ChartSection from "@/components/summary/ChartSection";
import DailyLineChart from "@/components/summary/DailyLineChart";
import TopCollectorsChart from "@/components/summary/TopCollectorsChart";
import PaymentStatus from "@/components/summary/PaymentStatus";
import ExpenseTotals from "@/components/summary/ExpenseTotals";
import AppContext from "@/components/summary/context";

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
      const expenseId = typeof tx.expenseId === "string" ? tx.expenseId : String(tx.expenseId);
      acc[expenseId] = (acc[expenseId] || 0) + tx.amount;
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
