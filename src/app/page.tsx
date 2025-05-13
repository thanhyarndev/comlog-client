'use client';
import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, DollarSign, RefreshCw, Users, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseForm from '@/components/ExpensesForm';
import ExpenseList from '@/components/ExpenseList';
import EmployeesPage from './employees/page';
import type { Expense } from './data/mockData';

const LOCAL_KEY = 'expenses_data';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'dd/MM/yyyy');

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setExpenses(parsed);
      } catch (e) {
        console.error('Invalid expenses data in localStorage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (data: Omit<Expense, 'id' | 'isCollected'>) => {
    const newExpense: Expense = {
      ...data,
      id: uuidv4(),
      isCollected: false,
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowExpenseForm(false);
  };

  const togglePaidStatus = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isCollected: !e.isCollected } : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
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
              <ExpenseList/>
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
