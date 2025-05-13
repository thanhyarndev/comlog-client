export interface Expense {
  _id: string;
  title: string;
  date: string; // ISO string, e.g., '2025-05-13'
  totalAmount: number;
  totalReceived: number;
  createdAt?: string;
  updatedAt?: string;
}
