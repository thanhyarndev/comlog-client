import axios from 'axios';
import type { Expense } from '@/types/expense';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

export async function getAllExpenses(): Promise<Expense[]> {
  const res = await axios.get(BASE_URL);
  return res.data;
}

export async function toggleExpenseCollected(id: string): Promise<void> {
  await axios.put(`${BASE_URL}/${id}/toggle-collected`);
}

export async function deleteExpense(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}

// Optional: tạo expense
export async function createExpense(payload: {
  title: string;
  date: string;
  totalReceived?: number;
  notes?: string;
}): Promise<Expense> {
  const res = await axios.post(BASE_URL, payload);
  return res.data;
}

// Optional: tạo transaction
export async function createExpenseTransaction(payload: {
  expenseId: string;
  employeeId: string;
  amount: number;
  note?: string;
  receivedAmount?: number;
  status?: 'unpaid' | 'partial' | 'paid';
}): Promise<any> {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/expense-transactions`, payload);
  return res.data;
}

export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const res = await axios.get(`${BASE_URL}/range`, {
    params: { startDate, endDate },
  });
  return res.data;
}
