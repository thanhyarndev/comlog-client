export interface Employee {
  id: string;
  name: string;
  gender: 'male' | 'female';
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  date: string;
  employees: ExpenseItem[];
  description?: string;
  isCollected: boolean;
}

export const employees: Employee[] = [
  { id: 'u1', name: 'Nguyễn Văn A', gender: 'male' },
  { id: 'u2', name: 'Trần Thị B', gender: 'female' },
  { id: 'u3', name: 'Lê Thị C', gender: 'female' },
  { id: 'u4', name: 'Phạm Quốc D', gender: 'male' },
  { id: 'u5', name: 'Hoàng Thị E', gender: 'female' },
];

export const expenses: Expense[] = [
  {
    id: 'e1',
    date: '2025-05-12',
    employees: [
      { id: 'u1', name: 'Nguyễn Văn A', amount: 100000 },
      { id: 'u2', name: 'Trần Thị B', amount: 120000 },
    ],
    description: 'Ăn trưa tại quán ABC',
    isCollected: false,
  },
];