'use client';
import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, DollarSign, RefreshCw, Users, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseForm from '@/components/ExpensesForm';
import ExpenseList from '@/components/ExpenseList';
import EmployeesPage from '../employees/page';

import { createExpense, createExpenseTransaction, getAllExpenses, toggleExpenseCollected, deleteExpense } from '@/hooks/api/expense';
import type { Expense } from '@/types/expense';
import type { ExpenseItem } from '@/types/employee';

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');

  const loadExpenses = async () => {
    const data = await getAllExpenses();
    setExpenses(data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const addExpense = async (data: { title: string; date: string; employees: ExpenseItem[] }) => {
    const total = data.employees.reduce((sum, e) => sum + e.amount, 0);
    const expense = await createExpense({
      title: data.title,
      date: data.date,
      totalAmount: total,
      totalReceived: 0,
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

  const togglePaidStatus = async (id: string) => {
    await toggleExpenseCollected(id);
    loadExpenses();
  };

  const removeExpense = async (id: string) => {
    await deleteExpense(id);
    loadExpenses();
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
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
          {activeTab === 'expenses' && (
            <Button onClick={() => setShowExpenseForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm chi phí
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="expenses">
              <DollarSign className="mr-2 h-4 w-4" />
              Chi phí
            </TabsTrigger>
            <TabsTrigger value="summary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tổng hợp tuần
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="mr-2 h-4 w-4" />
              Nhân viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            {showExpenseForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Thêm chi phí ăn trưa mới</CardTitle>
                  <CardDescription>Nhập thông tin chi phí ăn trưa của nhân viên</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm
                    onSubmit={addExpense}
                    onCancel={() => setShowExpenseForm(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              <ExpenseList />
            )}
          </TabsContent>

          <TabsContent value="summary">
            <div className="text-muted-foreground italic">(Weekly summary sẽ hiển thị ở đây)</div>
          </TabsContent>

          <TabsContent value="employees">
            <EmployeesPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
