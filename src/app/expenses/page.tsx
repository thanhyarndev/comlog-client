'use client';

import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpensesForm';
import {
  createExpense,
  createExpenseTransaction,
  deleteExpense,
  getAllExpenses,
  toggleExpenseCollected,
} from '@/hooks/api/expense';
import {
  getExpenseTransactionsByFilter,
  updateExpenseTransaction,
} from '@/hooks/api/expenseTransaction';
import { getEmployees } from '@/hooks/api/employee';
import type { Expense } from '@/types/expense';
import type { ExpenseItem, Employee } from '@/types/employee';
import type { ExpenseTransaction } from '@/types/transaction';

export default function ExpensesPage() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [allTransactions, setAllTransactions] = useState<ExpenseTransaction[]>([]);

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');

  const loadExpenses = async () => {
    const data = await getAllExpenses();
    setExpenses(data);
  };

  const loadEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const loadAllTransactions = async () => {
  const txs = await getExpenseTransactionsByFilter();
  setAllTransactions(txs);
};

  const loadTransactions = async (expenseId: string) => {
    const data = await getExpenseTransactionsByFilter({ expenseId });
    setTransactions(data);
    setSelectedExpenseId(expenseId);
    setShowModal(true);
  };

  useEffect(() => {
    loadExpenses();
    loadEmployees();
    loadAllTransactions();
  }, []);

  const addExpense = async (data: {
    title: string;
    date: string;
    notes?: string;
    employees: ExpenseItem[];
  }) => {
    const total = data.employees.reduce((sum, e) => sum + e.amount, 0);
    const expense = await createExpense({
      title: data.title,
      date: data.date,
      totalReceived: 0,
      notes: data.notes,
    });

    await Promise.all(
      data.employees.map(emp =>
        createExpenseTransaction({
          expenseId: expense._id,
          employeeId: emp.id,
          amount: emp.amount,
          note: emp.note,
          receivedAmount: 0,
          status: 'unpaid',
        })
      )
    );

    setShowExpenseForm(false);
    loadExpenses();
  };
  
  const handleToggleTransactionStatus = async (tx: ExpenseTransaction) => {
  const isPaid = tx.status === 'paid';
  await updateExpenseTransaction(tx._id, {
    receivedAmount: isPaid ? 0 : tx.amount,
    status: isPaid ? 'unpaid' : 'paid',
  });

  // Cập nhật lại cả 2
  if (selectedExpenseId) await loadTransactions(selectedExpenseId);
  await loadExpenses();
  await loadAllTransactions(); // 🆕 thêm dòng này
};


  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.alias || emp?.name || id;
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Chi phí Ăn trưa</h1>
        <p className="text-muted-foreground">Theo dõi chi phí ăn trưa của nhân viên và tổng hợp hàng tuần</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">
            Tuần hiện tại: {weekStart} - {weekEnd}
          </span>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm chi phí
        </Button>
      </div>

      {showExpenseForm && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm chi phí ăn trưa mới</CardTitle>
            <CardDescription>Nhập thông tin chi phí ăn trưa của nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onSubmit={addExpense} onCancel={() => setShowExpenseForm(false)} />
          </CardContent>
        </Card>
      )}

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
              {expenses.map(e => (
                <tr key={e._id} className="border-t">
                  <td className="px-4 py-2">{format(new Date(e.date), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-2">{e.title}</td>
                  <td className="px-4 py-2">{e.notes || '-'}</td>
                  <td className="px-4 py-2 text-right">
  {allTransactions
    .filter(tx => tx.expenseId === e._id)
    .reduce((sum, tx) => sum + tx.amount, 0)
    .toLocaleString()} ₫
</td>
<td className="px-4 py-2 text-right">
  {allTransactions
    .filter(tx => tx.expenseId === e._id)
    .reduce((sum, tx) => sum + tx.receivedAmount, 0)
    .toLocaleString()} ₫
</td>
                  <td className="px-4 py-2 text-center">
                    <Button variant="outline" size="sm" onClick={() => loadTransactions(e._id)}>
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Nhân viên</th>
                  <th className="px-4 py-2 text-right">Phải thu</th>
                  <th className="px-4 py-2 text-right">Đã thu</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} className="border-t">
                    <td className="px-4 py-2">{getEmployeeName(tx.employeeId)}</td>
                    <td className="px-4 py-2 text-right">{tx.amount.toLocaleString()} ₫</td>
                    <td className="px-4 py-2 text-right">{tx.receivedAmount.toLocaleString()} ₫</td>
                    <td className="px-4 py-2 text-center">
                      <Switch
                        checked={tx.status === 'paid'}
                        onCheckedChange={() => handleToggleTransactionStatus(tx)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
