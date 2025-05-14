export interface Employee {
  _id: string;
  id: string; // standardized key (from _id)
  name: string;
  alias?: string;
  gender: 'male' | 'female';
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  note?: string; 
}

export interface Expense {
  id: string;
  date: string;
  employees: ExpenseItem[];
  description?: string;
  isCollected: boolean;
}