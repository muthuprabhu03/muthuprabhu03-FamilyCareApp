export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export type BillCreate = Omit<Bill, 'id'>;
export type BillUpdate = Omit<Bill, 'id'>;

export interface Expense {
  id: number;
  familyMemberId: number;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export type ExpenseCreate = Omit<Expense, 'id'>;
export type ExpenseUpdate = Omit<Expense, 'id' | 'familyMemberId'>;

export interface Income {
  id: number;
  familyMemberId: number;
  source: string;
  amount: number;
  date: string;
  description?: string;
}

export type IncomeCreate = Omit<Income, 'id'>;
export type IncomeUpdate = Omit<Income, 'id' | 'familyMemberId'>;
