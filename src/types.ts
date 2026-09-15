export type CurrencyCode = 'USD' | 'IDR' | 'EUR' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromUSD: number;
  locale: string;
  name: string;
}

export type TabType = 'dashboard' | 'accounts' | 'budgeting' | 'transactions' | 'simulator' | 'settings';

export type ThemeId =
  | 'light-indigo'
  | 'light-emerald'
  | 'light-amber'
  | 'dark-obsidian'
  | 'dark-executive';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'light' | 'dark';
  description: string;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  joinedDate?: string;
  themePreference?: ThemeId;
}

export type AccountType = 'Bank' | 'E-Wallet' | 'Investment' | 'Cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // Stored in base USD for consistency
  institution?: string;
  accountNumberMask?: string;
  iconName: string;
  badgeColor: string;
}

export type TransactionType = 'income' | 'expense';
export type BudgetPillar = 'Needs' | 'Wants' | 'Savings';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Housing'
  | 'Groceries'
  | 'Food & Dining'
  | 'Transport'
  | 'Subscriptions'
  | 'Entertainment'
  | 'Health'
  | 'Shopping'
  | 'Utilities'
  | 'Others';

export interface Transaction {
  id: string;
  date: string;
  desc: string;
  category: TransactionCategory;
  pillar: BudgetPillar;
  type: TransactionType;
  amount: number; // in base USD
  accountId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number; // in base USD
  current: number; // in base USD
  category: string;
  deadline?: string;
  iconName: string;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number; // in base USD per month
  dueDate: string; // e.g. "Every 18th" or "18 Oct"
  category: string;
  iconName: string;
  active: boolean;
}

export interface FIREParams {
  capital: number;
  monthly: number;
  annualReturn: number; // in percentage (e.g. 8.0)
  desiredMonthlySpend: number;
}
