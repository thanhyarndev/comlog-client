export interface ExpenseTransaction {
  _id: string;
  expenseId: string;
  employeeId: string;
  amount: number;
  note?: string;
  receivedAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  createdAt?: string;
  updatedAt?: string;
}
