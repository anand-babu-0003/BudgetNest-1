export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  created_at: Date;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'investment' | 'savings';
  balance: number;
  created_at: Date;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  note?: string;
  tags?: string[];
  receipt_url?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  spent: number;
  recurrence: 'monthly' | 'weekly' | 'yearly';
  start_date: Date;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: Date;
  created_at: Date;
}