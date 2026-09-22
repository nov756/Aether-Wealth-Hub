export type CurrencyCode = 'USD' | 'IDR' | 'EUR' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromUSD: number;
  locale: string;
  name: string;
}

export type TabType = 'dashboard' | 'accounts' | 'budgeting' | 'transactions' | 'simulator' | 'calendar' | 'settings';

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
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  photoURL?: string;
  joinedDate?: string;
  themePreference?: ThemeId;
  currencyCode?: CurrencyCode;
  authProvider?: 'google' | 'email' | 'demo' | 'guest';
}

export interface AIInsightItem {
  title: string;
  type: 'positive' | 'warning' | 'opportunity' | string;
  detail: string;
  impact: string;
}

export interface AIRecommendationItem {
  step: string;
  action: string;
  expectedBenefit: string;
}

export interface AIAnalystData {
  healthDiagnosis: string;
  spendingAnomalyScore: string;
  keyMetricsSummary: {
    dominantCategory: string;
    dailyBurnRate: string;
    savingsPotential: string;
  };
  insights: AIInsightItem[];
  actionableRecommendations: AIRecommendationItem[];
  fireImpactNote: string;
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

export interface DailyHabitTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DailyStreakDay {
  dayLabel: string;
  date: string;
  checked: boolean;
  isToday: boolean;
}

export interface DailyStreakState {
  streakCount: number;
  lastCheckInDate: string;
  checkedInToday: boolean;
  bestStreak: number;
  weeklyActivity: DailyStreakDay[];
  dailyTasks: DailyHabitTask[];
  reminderEnabled: boolean;
  reminderTime: string;
}

export type PlanCategory = 'Review' | 'Savings' | 'Investment' | 'Bills' | 'Debt' | 'FIRE';

export type PlanRecurrence = 'once' | 'weekly' | 'monthly' | 'yearly';

export interface FinancialCalendarPlan {
  id: string;
  title: string;
  category: PlanCategory;
  description: string;
  targetAmount?: number; // In base USD
  targetDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  recurrence: PlanRecurrence;
  reminderMinutes: number; // e.g. 15, 60, 1440
  googleEventId?: string;
  googleEventLink?: string;
  syncedAt?: string;
  status: 'planned' | 'synced' | 'completed';
}


