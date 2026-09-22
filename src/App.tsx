import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Account,
  CurrencyCode,
  CurrencyConfig,
  FinancialCalendarPlan,
  FIREParams,
  SavingsGoal,
  Subscription,
  TabType,
  ThemeId,
  Transaction,
  TransactionType,
  User,
} from './types';
import { THEMES } from './data/themes';
import {
  CURRENCIES,
  INITIAL_ACCOUNTS,
  INITIAL_FIRE_PARAMS,
  INITIAL_GOALS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { INITIAL_STREAK_STATE, getTodayDateString, generateWeeklyDays } from './data/streakData';
import { Header } from './components/Header';
import { AppSidebar } from './components/AppSidebar';
import { AppTopBar } from './components/AppTopBar';
import { MobileBottomBar } from './components/MobileBottomBar';
import { LandingView } from './components/LandingView';
import { DashboardTab } from './components/DashboardTab';
import { AccountsTab } from './components/AccountsTab';
import { BudgetingTab } from './components/BudgetingTab';
import { TransactionsTab } from './components/TransactionsTab';
import { CalendarTab } from './components/CalendarTab';
import { FIRESimulatorTab } from './components/FIRESimulatorTab';
import { SettingsTab } from './components/SettingsTab';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { GoalModal } from './components/GoalModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AuthModal } from './components/AuthModals';
import { CheckCircle2 } from 'lucide-react';
import { DailyStreakState } from './types';

const STORAGE_KEY_PREFIX = 'aether_wealth_bright_v2_';

const DEFAULT_DEMO_USER: User = {
  name: 'Alex Rivera',
  email: 'alex@aether.io',
  role: 'Pro Member',
  avatarInitials: 'AR',
  joinedDate: 'September 2026',
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  // Top-Level View: 'landing' or 'app'
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('app');

  // Theme Model State (Saved in user account and LocalStorage)
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as ThemeId;
      if (saved) return saved;
      if (currentUser?.themePreference) return currentUser.themePreference;
      return 'light-indigo';
    } catch {
      return 'light-indigo';
    }
  });

  // App Tabs: 'dashboard' | 'accounts' | 'budgeting' | 'transactions' | 'simulator' | 'settings'
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES.USD);

  // Financial Data State
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}subscriptions`);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  const [fireParams, setFireParams] = useState<FIREParams>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fire_params`);
      return saved ? JSON.parse(saved) : INITIAL_FIRE_PARAMS;
    } catch {
      return INITIAL_FIRE_PARAMS;
    }
  });

  const [plans, setPlans] = useState<FinancialCalendarPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}plans`);
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  // Modal Visibility States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('expense');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  // Daily Track & Streak State (Saved in LocalStorage)
  const [streak, setStreak] = useState<DailyStreakState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}streak`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = getTodayDateString();
        const checkedToday = parsed.lastCheckInDate === todayStr;
        return {
          ...parsed,
          checkedInToday: checkedToday,
          weeklyActivity: generateWeeklyDays(parsed.lastCheckInDate),
        };
      }
      return INITIAL_STREAK_STATE;
    } catch {
      return INITIAL_STREAK_STATE;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync Streak to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}streak`, JSON.stringify(streak));
    } catch (e) {
      console.error(e);
    }
  }, [streak]);

  // Streak Action Handlers
  const handleCheckInStreak = () => {
    const todayStr = getTodayDateString();
    if (streak.checkedInToday && streak.lastCheckInDate === todayStr) {
      showToast('Streak hari ini sudah tercatat. Pertahankan konsistensi finansial!');
      return;
    }

    const nextCount = streak.streakCount + 1;
    const nextBest = Math.max(streak.bestStreak, nextCount);

    setStreak((prev) => ({
      ...prev,
      streakCount: nextCount,
      bestStreak: nextBest,
      lastCheckInDate: todayStr,
      checkedInToday: true,
      weeklyActivity: generateWeeklyDays(todayStr),
    }));

    showToast(`🔥 Streak bertambah! ${nextCount} Hari Disiplin Finansial!`);
  };

  const handleToggleStreakTask = (taskId: string) => {
    setStreak((prev) => {
      const updated = prev.dailyTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        dailyTasks: updated,
      };
    });
  };

  const handleToggleReminder = () => {
    setStreak((prev) => {
      const nextVal = !prev.reminderEnabled;
      showToast(`Pengingat keuangan harian ${nextVal ? 'diaktifkan (20:00)' : 'dinonaktifkan'}.`);
      return {
        ...prev,
        reminderEnabled: nextVal,
      };
    });
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}accounts`, JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}subscriptions`, JSON.stringify(subscriptions));
    } catch (e) {
      console.error(e);
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}fire_params`, JSON.stringify(fireParams));
    } catch (e) {
      console.error(e);
    }
  }, [fireParams]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}plans`, JSON.stringify(plans));
    } catch (e) {
      console.error(e);
    }
  }, [plans]);

  // Sync theme model to document body and LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, theme);
      document.documentElement.className = `theme-${theme}`;
      document.body.className = `min-h-screen theme-${theme} transition-colors duration-300 antialiased font-sans`;
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Auth Actions
  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.themePreference) {
      setTheme(user.themePreference);
    }
    setCurrentView('app');
    showToast(`Selamat datang, ${user.name}!`);
  };

  const handleSelectTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        themePreference: newTheme,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
    }
    const themeName = THEMES.find((t) => t.id === newTheme)?.name || newTheme;
    showToast(`Model tema berhasil diubah: ${themeName}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Anda telah keluar dari akun.');
  };

  const handleDemoLogin = () => {
    setCurrentUser(DEFAULT_DEMO_USER);
    setCurrentView('app');
    setActiveTab('dashboard');
    showToast('Mode Demo Aktif: Alex Rivera');
  };

  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated);
    showToast('Profil pengguna berhasil disimpan.');
  };

  // Transaction Actions
  const handleOpenTransaction = (type: TransactionType) => {
    setTxModalType(type);
    setTxModalOpen(true);
  };

  const handleSaveTransaction = (txData: {
    desc: string;
    amountUSD: number;
    category: any;
    pillar: any;
    type: TransactionType;
    accountId: string;
  }) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      desc: txData.desc,
      category: txData.category,
      pillar: txData.pillar,
      type: txData.type,
      amount: txData.amountUSD,
      accountId: txData.accountId,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          const delta = txData.type === 'income' ? txData.amountUSD : -txData.amountUSD;
          return { ...acc, balance: Math.max(0, acc.balance + delta) };
        }
        return acc;
      })
    );

    showToast(
      txData.type === 'income'
        ? `Pemasukan berhasil dicatat: ${txData.desc}`
        : `Pengeluaran berhasil dicatat: ${txData.desc}`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi berhasil dihapus.');
  };

  // Account Actions
  const handleSaveAccount = (data: {
    name: string;
    type: any;
    balanceUSD: number;
    institution: string;
  }) => {
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: data.name,
      type: data.type,
      balance: data.balanceUSD,
      institution: data.institution,
      iconName: data.type === 'Bank' ? 'Building2' : 'Wallet',
      badgeColor: 'blue',
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Akun ${data.name} berhasil ditambahkan!`);
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      showToast('Anda harus menyisakan setidaknya 1 akun aktif.');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Akun berhasil dihapus.');
  };

  const handleUpdateBalance = (id: string, newBalanceUSD: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, balance: newBalanceUSD } : a))
    );
    showToast('Saldo akun berhasil diperbarui.');
  };

  // Savings Goals Actions
  const handleSaveGoal = (goalData: {
    name: string;
    targetUSD: number;
    currentUSD: number;
    category: string;
    deadline: string;
    iconName: string;
  }) => {
    const newGoal: SavingsGoal = {
      id: `g_${Date.now()}`,
      name: goalData.name,
      target: goalData.targetUSD,
      current: goalData.currentUSD,
      category: goalData.category,
      deadline: goalData.deadline,
      iconName: goalData.iconName,
      color: 'emerald',
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast(`Target tabungan "${goalData.name}" berhasil dibuat!`);
  };

  const handleDepositGoal = (goalId: string, amountUSD: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, current: g.current + amountUSD } : g))
    );
    showToast('Dana berhasil disetorkan ke target tabungan!');
  };

  // Subscription Actions
  const handleSaveSubscription = (subData: {
    name: string;
    costUSD: number;
    dueDate: string;
    category: string;
    iconName: string;
  }) => {
    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      name: subData.name,
      cost: subData.costUSD,
      dueDate: subData.dueDate,
      category: subData.category,
      iconName: subData.iconName,
      active: true,
    };
    setSubscriptions((prev) => [...prev, newSub]);
    showToast(`Langganan ${subData.name} berhasil ditambahkan!`);
  };

  const handleToggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Data Export & Reset
  const handleExportData = () => {
    const dataToExport = {
      currentUser,
      currencyCode: currency.code,
      accounts,
      transactions,
      goals,
      subscriptions,
      fireParams,
      plans,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aether_wealth_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data cadangan berhasil diunduh (JSON).');
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data finansial ke contoh awal Aether OS?')) {
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setFireParams(INITIAL_FIRE_PARAMS);
      setPlans(INITIAL_PLANS);
      showToast('Data berhasil dikembalikan ke pengaturan default.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-800 antialiased transition-colors">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Routing: Landing View vs App Workspace with Left Sidebar */}
      {currentView === 'landing' ? (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header on Landing */}
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            currentTheme={theme}
            onSelectTheme={handleSelectTheme}
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onLogout={handleLogout}
            currency={currency}
            setCurrency={setCurrency}
            onOpenTransaction={handleOpenTransaction}
            onResetData={handleResetData}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <LandingView
              currency={currency}
              onOpenRegister={handleOpenRegister}
              onOpenLogin={handleOpenLogin}
              onDemoLogin={handleDemoLogin}
            />
          </main>

          {/* Landing Footer */}
          <footer className="border-t border-slate-200 bg-white/70 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">Aether OS</span>
                <span>• Desain Terang & Interaktif</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('app')}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Buka Dashboard
                </button>
                <span>Kaidah 50/30/20 • Trinity 4% FIRE Rule</span>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <div className="flex-1 flex min-w-0">
          {/* Fiture-Fiture di Sebelah Kiri Pengguna (Left Sidebar) */}
          <AppSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            onOpenTransaction={handleOpenTransaction}
            currency={currency}
            streak={streak}
            onCheckInStreak={handleCheckInStreak}
            onToggleStreakTask={handleToggleStreakTask}
            onToggleReminder={handleToggleReminder}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
          />

          {/* Isi Konten di Sebelah Kanan (Right Main Content Area) */}
          <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50/70">
            {/* Top Navigation & Controls */}
            <AppTopBar
              activeTab={activeTab}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              currency={currency}
              setCurrency={setCurrency}
              currentTheme={theme}
              onSelectTheme={handleSelectTheme}
              onOpenTransaction={handleOpenTransaction}
              onResetData={handleResetData}
              streak={streak}
              currentUser={currentUser}
            />

            {/* Active Feature Tab Body */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DashboardTab
                      accounts={accounts}
                      transactions={transactions}
                      goals={goals}
                      subscriptions={subscriptions}
                      fireParams={fireParams}
                      currency={currency}
                      setActiveTab={setActiveTab}
                      onOpenTransaction={handleOpenTransaction}
                      streak={streak}
                      onCheckInStreak={handleCheckInStreak}
                      plans={plans}
                      onDepositGoal={handleDepositGoal}
                    />
                  </motion.div>
                )}

                {activeTab === 'accounts' && (
                  <motion.div
                    key="accounts"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AccountsTab
                      accounts={accounts}
                      currency={currency}
                      onOpenAddAccount={() => setAccountModalOpen(true)}
                      onDeleteAccount={handleDeleteAccount}
                      onUpdateBalance={handleUpdateBalance}
                    />
                  </motion.div>
                )}

                {activeTab === 'budgeting' && (
                  <motion.div
                    key="budgeting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BudgetingTab
                      transactions={transactions}
                      goals={goals}
                      subscriptions={subscriptions}
                      currency={currency}
                      onOpenAddGoal={() => setGoalModalOpen(true)}
                      onOpenAddSub={() => setSubModalOpen(true)}
                      onToggleSubscription={handleToggleSubscription}
                      onDepositGoal={handleDepositGoal}
                    />
                  </motion.div>
                )}

                {activeTab === 'transactions' && (
                  <motion.div
                    key="transactions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TransactionsTab
                      transactions={transactions}
                      accounts={accounts}
                      currency={currency}
                      onOpenAddTransaction={handleOpenTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                    />
                  </motion.div>
                )}

                {activeTab === 'simulator' && (
                  <motion.div
                    key="simulator"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FIRESimulatorTab
                      params={fireParams}
                      setParams={setFireParams}
                      currency={currency}
                    />
                  </motion.div>
                )}

                {activeTab === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CalendarTab
                      plans={plans}
                      setPlans={setPlans}
                      currency={currency}
                    />
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SettingsTab
                      currentUser={currentUser}
                      onUpdateUser={handleUpdateUser}
                      currentTheme={theme}
                      onSelectTheme={handleSelectTheme}
                      currency={currency}
                      setCurrency={setCurrency}
                      onResetData={handleResetData}
                      onLogout={handleLogout}
                      onExportData={handleExportData}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* App Footer */}
            <footer className="border-t border-slate-200/90 bg-white/70 py-5 mt-auto pb-24 lg:pb-5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Aether OS</span>
                  <span>• Desain Terang & Interaktif</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Lihat Halaman Depan
                  </button>
                  <span>Kaidah 50/30/20 • Trinity 4% FIRE Rule</span>
                </div>
              </div>
            </footer>

            {/* Mobile Bottom Navigation & Action Bar (One-Hand Reachability) */}
            <MobileBottomBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSidebar={() => setMobileSidebarOpen(true)}
              onOpenTransaction={handleOpenTransaction}
              streak={streak}
              onCheckInStreak={handleCheckInStreak}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Auth Modal (Login & Register) */}
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authModalMode}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        )}

        {/* Transaction Modal */}
        {txModalOpen && (
          <TransactionModal
            isOpen={txModalOpen}
            onClose={() => setTxModalOpen(false)}
            defaultType={txModalType}
            accounts={accounts}
            currency={currency}
            onSave={handleSaveTransaction}
          />
        )}

        {/* Account Modal */}
        {accountModalOpen && (
          <AccountModal
            isOpen={accountModalOpen}
            onClose={() => setAccountModalOpen(false)}
            currency={currency}
            onSave={handleSaveAccount}
          />
        )}

        {/* Goal Modal */}
        {goalModalOpen && (
          <GoalModal
            isOpen={goalModalOpen}
            onClose={() => setGoalModalOpen(false)}
            currency={currency}
            onSave={handleSaveGoal}
          />
        )}

        {/* Subscription Modal */}
        {subModalOpen && (
          <SubscriptionModal
            isOpen={subModalOpen}
            onClose={() => setSubModalOpen(false)}
            currency={currency}
            onSave={handleSaveSubscription}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
