import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Wallet,
  PieChart,
  ReceiptText,
  Flame,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  Globe,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  User as UserIcon,
  Palette,
  Check,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyCode, CurrencyConfig, TabType, ThemeId, User } from '../types';
import { CURRENCIES } from '../data/initialData';
import { THEMES } from '../data/themes';

interface HeaderProps {
  currentView: 'landing' | 'app';
  setCurrentView: (v: 'landing' | 'app') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: User | null;
  currentTheme: ThemeId;
  onSelectTheme: (t: ThemeId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  currency: CurrencyConfig;
  setCurrency: (c: CurrencyConfig) => void;
  onOpenTransaction: (type: 'income' | 'expense') => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  currentUser,
  currentTheme,
  onSelectTheme,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  currency,
  setCurrency,
  onOpenTransaction,
  onResetData,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'accounts', label: 'Matrix Akun', icon: <Wallet className="w-4 h-4" /> },
    { id: 'budgeting', label: '50/30/20', icon: <PieChart className="w-4 h-4" /> },
    { id: 'transactions', label: 'Cashflow', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'simulator', label: 'FIRE Simulator', icon: <Flame className="w-4 h-4 text-amber-500" /> },
    { id: 'settings', label: 'Pengaturan & Tema', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView(currentView === 'landing' ? 'app' : 'landing')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title={currentView === 'app' ? 'Lihat Halaman Depan (Landing)' : 'Buka Dashboard'}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  AETHER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  PRO OS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase hidden sm:block">
                Wealth & Financial Planner
              </p>
            </div>
          </div>

          {/* Center Navigation: Only when in 'app' view */}
          {currentView === 'app' ? (
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive ? 'text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/70"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                      />
                    )}
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setCurrentView('app')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Buka Dashboard</span>
              </button>
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Selector Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                title="Ganti Model Tema Tampilan"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white shrink-0"
                  style={{ backgroundColor: currentThemeObj.primaryColor }}
                />
                <span className="hidden sm:inline text-xs">{currentThemeObj.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Model Tema Tampilan</span>
                      <Palette className="w-3 h-3 text-indigo-500" />
                    </div>

                    {THEMES.map((t) => {
                      const active = currentTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTheme(t.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                            active
                              ? 'bg-indigo-50 text-indigo-900 font-extrabold'
                              : 'hover:bg-slate-50 text-slate-700 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: t.primaryColor }}
                            />
                            <div>
                              <div className="text-xs">{t.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {t.category === 'light' ? 'Mode Cerah' : 'Mode Gelap'}
                              </div>
                            </div>
                          </div>
                          {active && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/70 rounded-xl px-2.5 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <select
                id="currency-select"
                value={currency.code}
                onChange={(e) => setCurrency(CURRENCIES[e.target.value as CurrencyCode])}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Pilih Mata Uang"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* In 'app' view: quick income/expense buttons */}
            {currentView === 'app' && (
              <>
                <button
                  id="btn-add-income"
                  onClick={() => onOpenTransaction('income')}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Income</span>
                </button>

                <button
                  id="btn-add-expense"
                  onClick={() => onOpenTransaction('expense')}
                  className="hidden xs:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Expense</span>
                </button>
              </>
            )}

            {/* Auth Section */}
            {currentUser ? (
              /* User Profile Badge (Logged In) */
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
                <button
                  onClick={() => {
                    setCurrentView('app');
                    setActiveTab('settings');
                  }}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
                  title="Lihat Profil & Ubah Tema"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {currentUser.avatarInitials}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {currentUser.role}
                    </div>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  title="Keluar dari Akun"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Auth Buttons (Logged Out) */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="btn-nav-login"
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  id="btn-nav-register"
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
                >
                  Daftar Akun
                </button>
              </div>
            )}

            {/* Quick Home/Landing Toggle button when in app view */}
            {currentView === 'app' && (
              <button
                onClick={() => setCurrentView('landing')}
                title="Kembali ke Halaman Depan"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Sub Navigation Bar (Only in App view) */}
        {currentView === 'app' && (
          <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
