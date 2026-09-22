import {
  Account,
  CurrencyCode,
  DailyStreakState,
  FinancialCalendarPlan,
  FIREParams,
  SavingsGoal,
  Subscription,
  ThemeId,
  Transaction,
  User,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_FIRE_PARAMS,
  INITIAL_GOALS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import { generateWeeklyDays } from '../data/streakData';

export const MULTIUSER_STORAGE_PREFIX = 'aether_multiuser_v3_';

// 1. CLEAN ZERO-SLATE DEFAULTS (Semua dimulai dari 0 untuk setiap pengguna baru)
export const getCleanAccounts = (): Account[] => [
  {
    id: `acc_${Date.now()}_main`,
    name: 'Rekening Utama / Dompet',
    type: 'Bank',
    balance: 0,
    institution: 'Bank / Tunai',
    accountNumberMask: '•••• 0001',
    iconName: 'Building2',
    badgeColor: 'blue',
  },
];

export const getCleanTransactions = (): Transaction[] => [];

export const getCleanGoals = (): SavingsGoal[] => [];

export const getCleanSubscriptions = (): Subscription[] => [];

export const getCleanPlans = (): FinancialCalendarPlan[] => [];

export const getCleanFIREParams = (): FIREParams => ({
  capital: 0,
  monthly: 0,
  annualReturn: 7.0,
  desiredMonthlySpend: 1000,
});

export const getCleanStreak = (): DailyStreakState => ({
  currentStreak: 0,
  longestStreak: 0,
  lastCheckInDate: '',
  checkedInToday: false,
  reminderEnabled: true,
  reminderTime: '20:00',
  weeklyActivity: generateWeeklyDays(''),
  dailyTasks: [
    { id: 't1', title: 'Catat pengeluaran hari ini', completed: false, xp: 20 },
    { id: 't2', title: 'Cek saldo rekening utama', completed: false, xp: 15 },
    { id: 't3', title: 'Hindari belanja impulsif', completed: false, xp: 25 },
  ],
});

// Helper to sanitize user id into a safe storage key
export const getSafeUserKey = (userId: string): string => {
  return userId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
};

// 2. USER REGISTRY (Daftar Akun Pengguna yang Tersimpan di Perangkat/Domain)
export const getStoredUsersList = (): User[] => {
  try {
    const raw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}registry`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read users registry', e);
    return [];
  }
};

export const saveUserToRegistry = (user: User): void => {
  try {
    const list = getStoredUsersList();
    const existingIndex = list.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem(`${MULTIUSER_STORAGE_PREFIX}registry`, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save user to registry', e);
  }
};

export const removeUserFromRegistry = (userId: string): void => {
  try {
    const list = getStoredUsersList().filter((u) => u.id !== userId);
    localStorage.setItem(`${MULTIUSER_STORAGE_PREFIX}registry`, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to remove user from registry', e);
  }
};

export const getActiveUserId = (): string | null => {
  try {
    return localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}active_user_id`);
  } catch {
    return null;
  }
};

export const setActiveUserId = (userId: string | null): void => {
  try {
    if (userId) {
      localStorage.setItem(`${MULTIUSER_STORAGE_PREFIX}active_user_id`, userId);
    } else {
      localStorage.removeItem(`${MULTIUSER_STORAGE_PREFIX}active_user_id`);
    }
  } catch (e) {
    console.error('Failed to set active user id', e);
  }
};

// 3. USER-SCOPED DATA ACCESS (Isolasi data antar setiap orang secara mandiri)
export const loadUserData = (userId: string) => {
  const key = getSafeUserKey(userId);

  let accounts: Account[] = getCleanAccounts();
  let transactions: Transaction[] = getCleanTransactions();
  let goals: SavingsGoal[] = getCleanGoals();
  let subscriptions: Subscription[] = getCleanSubscriptions();
  let plans: FinancialCalendarPlan[] = getCleanPlans();
  let fireParams: FIREParams = getCleanFIREParams();
  let streak: DailyStreakState = getCleanStreak();
  let currencyCode: CurrencyCode = 'IDR';
  let theme: ThemeId = 'light-indigo';

  try {
    const accRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_accounts`);
    if (accRaw) accounts = JSON.parse(accRaw);

    const txRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_transactions`);
    if (txRaw) transactions = JSON.parse(txRaw);

    const gRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_goals`);
    if (gRaw) goals = JSON.parse(gRaw);

    const subRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_subscriptions`);
    if (subRaw) subscriptions = JSON.parse(subRaw);

    const planRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_plans`);
    if (planRaw) plans = JSON.parse(planRaw);

    const fireRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_fire_params`);
    if (fireRaw) fireParams = JSON.parse(fireRaw);

    const streakRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_streak`);
    if (streakRaw) streak = JSON.parse(streakRaw);

    const curRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_currency`);
    if (curRaw) currencyCode = curRaw as CurrencyCode;

    const themeRaw = localStorage.getItem(`${MULTIUSER_STORAGE_PREFIX}${key}_theme`);
    if (themeRaw) theme = themeRaw as ThemeId;
  } catch (e) {
    console.error('Error loading scoped user data:', e);
  }

  return {
    accounts,
    transactions,
    goals,
    subscriptions,
    plans,
    fireParams,
    streak,
    currencyCode,
    theme,
  };
};

export const saveUserScopedItem = (userId: string, itemKey: string, data: any): void => {
  try {
    const key = getSafeUserKey(userId);
    const storageKey = `${MULTIUSER_STORAGE_PREFIX}${key}_${itemKey}`;
    if (typeof data === 'string') {
      localStorage.setItem(storageKey, data);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`Failed to save scoped item ${itemKey} for user ${userId}`, e);
  }
};

// Reset data to complete clean 0-state
export const resetUserToZero = (userId: string) => {
  const cleanAccounts = getCleanAccounts();
  const cleanTx = getCleanTransactions();
  const cleanGoals = getCleanGoals();
  const cleanSubs = getCleanSubscriptions();
  const cleanPlans = getCleanPlans();
  const cleanFire = getCleanFIREParams();
  const cleanStreak = getCleanStreak();

  saveUserScopedItem(userId, 'accounts', cleanAccounts);
  saveUserScopedItem(userId, 'transactions', cleanTx);
  saveUserScopedItem(userId, 'goals', cleanGoals);
  saveUserScopedItem(userId, 'subscriptions', cleanSubs);
  saveUserScopedItem(userId, 'plans', cleanPlans);
  saveUserScopedItem(userId, 'fire_params', cleanFire);
  saveUserScopedItem(userId, 'streak', cleanStreak);

  return {
    accounts: cleanAccounts,
    transactions: cleanTx,
    goals: cleanGoals,
    subscriptions: cleanSubs,
    plans: cleanPlans,
    fireParams: cleanFire,
    streak: cleanStreak,
  };
};

// Optional: Load sample demo data for this specific user if requested
export const loadDemoDataForUser = (userId: string) => {
  saveUserScopedItem(userId, 'accounts', INITIAL_ACCOUNTS);
  saveUserScopedItem(userId, 'transactions', INITIAL_TRANSACTIONS);
  saveUserScopedItem(userId, 'goals', INITIAL_GOALS);
  saveUserScopedItem(userId, 'subscriptions', INITIAL_SUBSCRIPTIONS);
  saveUserScopedItem(userId, 'plans', INITIAL_PLANS);
  saveUserScopedItem(userId, 'fire_params', INITIAL_FIRE_PARAMS);

  return {
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    goals: INITIAL_GOALS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    plans: INITIAL_PLANS,
    fireParams: INITIAL_FIRE_PARAMS,
  };
};
