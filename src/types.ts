export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = 'consumption' | 'savings';
export type PaymentMethod = 'cash' | 'card' | 'point';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  amount: number;
  description: string;
  isFixed?: boolean;
}
