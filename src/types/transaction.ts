export interface ExpenseTransaction {
  _id: string;
  expenseId: { title: string; date: string } | string;
  amount: number;
  employeeId: string;
  note?: string;
  receivedAmount: number;
  status: "unpaid" | "partial" | "paid";
  createdAt?: string;
  updatedAt?: string;
}
