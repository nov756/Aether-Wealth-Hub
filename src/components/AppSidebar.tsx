import React, { useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Wallet,
  PieChart,
  ReceiptText,
  Flame,
  Settings,
  PlusCircle,
  Home,
  LogOut,
  LogIn,
  X,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyConfig, DailyStreakState, TabType, User } from '../types';
import { DailyStreakWidget } from './DailyStreakWidget';

interface AppSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentView: 'landing' | 'app';
  setCurrentView: (v: 'landing' | 'app') => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTransaction: (type: 'income' | 'expense') => void;
  currency: CurrencyConfig;
  streak: DailyStreakState;
  onCheckInStreak: () => void;
  onToggleStreakTask: (taskId: string) => void;
  onToggleReminder: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentView,
  setCurrentView,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenTransaction,
  currency,
  streak,
  onCheckInStreak,
  onToggleStreakTask,
  onToggleReminder,
  mobileOpen,
  setMobileOpen,
}) => {
  // Lock body scroll and listen for Escape key on mobile when slide-over is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen, setMobileOpen]);

  const navItems: {
    id: TabType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Ringkasan & AI',
      sublabel: 'Overview & Arus Kas',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'accounts',
      label: 'Matrix Akun & Aset',
      sublabel: 'Perbankan, Kas, Portofolio',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'budgeting',
      label: 'Alokasi 50/30/20 & Goals',
      sublabel: 'Pilar Anggaran & Target',
      icon: <PieChart className="w-4 h-4" />,
      badge: 'Cerdas',
    },
    {
      id: 'transactions',
      label: 'Mutasi Transaksi',
      sublabel: 'Riwayat & Entri Catatan',
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Google Kalender & Plan',
      sublabel: 'Ajuin Jadwal & Sinkronisasi',
      icon: <CalendarCheck className="w-4 h-4 text-sky-600" />,
      badge: 'Google',
    },
    {
      id: 'simulator',
      label: 'Simulasi FIRE',
      sublabel: 'Pensiun Dini & Compounding',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      badge: 'FIRE',
    },
    {
      id: 'settings',
      label: 'Pengaturan & Tema',
      sublabel: 'Preferensi & Kustomisasi',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (currentView !== 'app') setCurrentView('app');
    setMobileOpen(false);
  };

  // Internal component for sidebar content to avoid duplication
  const renderSidebarInner = (isMobile: boolean) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Branding Section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div
          onClick={() => {
            setCurrentView('landing');
            if (isMobile) setMobileOpen(false);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Kembali ke Landing Page"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Aether Wealth
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
              Financial OS & Tracker
            </p>
          </div>
        </div>

        {/* Close button on mobile slide-over */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Middle Body (Daily Track & Navigation) */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Quick One-Hand Action Buttons in Mobile Drawer */}
        <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/80">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2">
            Aksi Cepat Transaksi
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                onOpenTransaction('expense');
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/90 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <ArrowDownLeft className="w-4 h-4 text-rose-600" />
              <span>- Keluar</span>
            </button>
            <button
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                onOpenTransaction('income');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>+ Masuk</span>
            </button>
          </div>
        </div>

        {/* Daily Track & Streak Section */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Daily Track & Streak</span>
            </span>
            <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {streak.streakCount} Hari
            </span>
          </div>

          <DailyStreakWidget
            streak={streak}
            onCheckIn={onCheckInStreak}
            onToggleTask={onToggleStreakTask}
            onToggleReminder={onToggleReminder}
            onOpenTransaction={() => {
              if (isMobile) setMobileOpen(false);
              onOpenTransaction('expense');
            }}
          />
        </div>

        {/* Navigation Menu */}
        <div>
          <div className="px-1 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Semua Fitur Aplikasi
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id && currentView === 'app';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer group text-left min-h-[48px] active:scale-98 ${
                    isActive
                      ? 'bg-indigo-50/95 text-indigo-900 border border-indigo-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                              isActive
                                ? 'bg-indigo-200 text-indigo-900'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive
                        ? 'text-indigo-600 translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Landing Page Shortcut */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setCurrentView(currentView === 'landing' ? 'app' : 'landing');
              if (isMobile) setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span>Halaman Depan</span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {currentView === 'landing' ? 'Sedang dibuka' : 'Info & Showcase'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Bottom User Profile Section (Easy Thumb Reach) */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 min-h-[44px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {currentUser.avatarInitials || 'AR'}
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs text-slate-900 block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate block">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                onLogout();
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Keluar dari Akun"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              onOpenLogin();
            }}
            className="w-full py-3 px-3 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>Masuk Akun</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE RESPONSIVE SLIDE-OVER DRAWER (Hardware-accelerated with motion) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop with fade-in & tap to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-[86vw] max-w-sm h-full bg-white flex flex-col justify-between shadow-2xl border-r border-slate-200 focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi Menu Utama"
            >
              {renderSidebarInner(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP PERMANENT STATIC SIDEBAR */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex-col justify-between min-h-screen sticky top-0 h-screen">
        {renderSidebarInner(false)}
      </aside>
    </>
  );
};
