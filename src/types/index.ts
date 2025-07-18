export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment';
  balance: number;
  color: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  parentId?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  description?: string;
  date: Date;
  createdAt: Date;
}

export interface TransactionWithDetails extends Transaction {
  category: Category;
  account: Account;
  toAccount?: Account;
}

export type DateRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}