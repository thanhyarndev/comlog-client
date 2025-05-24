export interface Expense {
  sessionId: any;
  isSessionBased: any;
  _id: string;
  title: string;
  date: string; // ISO string, e.g., '2025-05-13'
  totalAmount: number;
  totalReceived: number;
  notes?: string; 
  createdAt?: string;
  updatedAt?: string;
  
}
