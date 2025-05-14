import axios from 'axios';
import type { ExpenseTransaction } from '@/types/transaction';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/expense-transactions`;

// Tạo mới giao dịch
export async function createExpenseTransaction(payload: Omit<ExpenseTransaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseTransaction> {
  const res = await axios.post(BASE_URL, payload);
  return res.data;
}

// Lấy tất cả giao dịch hoặc lọc theo expenseId / employeeId
export async function getExpenseTransactionsByFilter(params?: {
  expenseId?: string;
  employeeId?: string;
}): Promise<ExpenseTransaction[]> {
  const res = await axios.get(BASE_URL + '/filter', { params });
  return res.data;
}

export async function getTransactionsByExpenseId(expenseId: string): Promise<ExpenseTransaction[]> {
  return getExpenseTransactionsByFilter({ expenseId });
}

// Cập nhật giao dịch
export async function updateExpenseTransaction(id: string, payload: Partial<ExpenseTransaction>): Promise<ExpenseTransaction> {
  const res = await axios.put(`${BASE_URL}/${id}`, payload);
  return res.data;
}

// Xoá giao dịch
export async function deleteExpenseTransaction(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}

export async function getExpenseTransactionsByExpense(expenseId: string): Promise<ExpenseTransaction[]> {
  const res = await axios.get(`${BASE_URL}/by-expense/${expenseId}`);
  return res.data;
}

