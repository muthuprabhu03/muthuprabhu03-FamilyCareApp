import { apiClient } from './apiClient';
import { Bill, BillCreate, BillUpdate, Expense, ExpenseCreate, ExpenseUpdate, Income, IncomeCreate, IncomeUpdate } from '../types/finance';

export const financeService = {
  // Bills
  getBills: () => apiClient.get<Bill[]>('/api/Bills'),
  getBillById: (id: number) => apiClient.get<Bill>(`/api/Bills/${id}`),
  createBill: (data: BillCreate) => apiClient.post<Bill>('/api/Bills', data),
  updateBill: (id: number, data: BillUpdate) => apiClient.put<Bill>(`/api/Bills/${id}`, data),
  deleteBill: (id: number) => apiClient.delete(`/api/Bills/${id}`),

  // Expenses
  getExpenses: () => apiClient.get<Expense[]>('/api/Expenses'),
  getExpenseById: (id: number) => apiClient.get<Expense>(`/api/Expenses/${id}`),
  createExpense: (data: ExpenseCreate) => apiClient.post<Expense>('/api/Expenses', data),
  updateExpense: (id: number, data: ExpenseUpdate) => apiClient.put<Expense>(`/api/Expenses/${id}`, data),
  deleteExpense: (id: number) => apiClient.delete(`/api/Expenses/${id}`),

  // Incomes
  getIncomes: () => apiClient.get<Income[]>('/api/Incomes'),
  getIncomeById: (id: number) => apiClient.get<Income>(`/api/Incomes/${id}`),
  createIncome: (data: IncomeCreate) => apiClient.post<Income>('/api/Incomes', data),
  updateIncome: (id: number, data: IncomeUpdate) => apiClient.put<Income>(`/api/Incomes/${id}`, data),
  deleteIncome: (id: number) => apiClient.delete(`/api/Incomes/${id}`)
};
