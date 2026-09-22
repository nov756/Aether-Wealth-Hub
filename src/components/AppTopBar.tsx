import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Flame,
  PlusCircle,
  MinusCircle,
  Globe,
  Palette,
  Check,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode, CurrencyConfig, DailyStreakState, TabType, ThemeId, User } from '../types';
import { CURRENCIES } from '../data/initialData';
import { THEMES } from '../data/themes';

interface AppTopBarProps {
  activeTab: TabType;
  onOpenMobileSidebar: () => void;
  currency: CurrencyConfig;
  setCurrency: (c: CurrencyConfig) => void;
  currentTheme: ThemeId;
  onSelectTheme: (t: ThemeId) => void;
  onOpenTransaction: (type: 'income' | 'expense') => void;
  onResetData: () => void;
  streak: DailyStreakState;
  currentUser: User | null;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  currency,
  setCurrency,
  currentTheme,
  onSelectTheme,
  onOpenTransaction,
  onResetData,
  streak,
  currentUser,
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

  const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Ringkasan & AI Analyst',
      subtitle: 'Analisis kesehatan keuangan 30 hari, arus kas & alokasi aset',
    },
    accounts: {
      title: 'Matrix Rekening & Portofolio',
      subtitle: 'Kelola saldo bank, kas harian, instrumen investasi & e-wallet',
    },
    budgeting: {
      title: 'Alokasi Anggaran 50/30/20 & Goals',
      subtitle: 'Pembagian pilar Needs, Wants, Savings, target tabungan & langganan',
    },
    transactions: {
      title: 'Mutasi & Jurnal Transaksi',
      subtitle: 'Pencatatan arus kas masuk dan pengeluaran berkala',
    },
    simulator: {
      title: 'Simulasi Kebebasan Finansial (FIRE)',
      subtitle: 'Proyeksi modal, return tahunan, dan estimasi waktu pensiun dini',
    },
    calendar: {
      title: 'Google Kalender & Rencana Finansial',
      subtitle: 'Ajuin jadwal evaluasi anggaran, setoran investasi berkala, dan sinkronkan ke Google Calendar',
    },
    settings: {
      title: 'Pengaturan & Preferensi Tema',
      subtitle: 'Kustomisasi antarmuka cerah, mata uang, dan cadangan data',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;
  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Mobile Menu Toggle & Tab Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center relative"
          title="Buka Menu Fitur"
          aria-label="Buka Menu Fitur"
        >
          <Menu className="w-5 h-5" />
          {streak.streakCount > 0 && !streak.checkedInToday && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
              {currentTabInfo.title}
            </h1>
            {/* Quick Streak Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black shrink-0">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{streak.streakCount} Hari Streak</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 truncate hidden md:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Quick Add, Currency, Theme, Reset */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Transaction Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => onOpenTransaction('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Tambah Pemasukan"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">+ Masuk</span>
          </button>
          <button
            onClick={() => onOpenTransaction('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Tambah Pengeluaran"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">- Keluar</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency.code}
            onChange={(e) => {
              const code = e.target.value as CurrencyCode;
              if (CURRENCIES[code]) setCurrency(CURRENCIES[code]);
            }}
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 pr-7 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            title="Ubah Mata Uang"
          >
            <option value="USD">USD ($)</option>
            <option value="IDR">IDR (Rp)</option>
            <option value="EUR">EUR (€)</option>
            <option value="SGD">SGD (S$)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme Picker Dropdown */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
            title="Ganti Model Tema Cerah"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: currentThemeObj.primaryColor }}
            />
            <span className="hidden md:inline">{currentThemeObj.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Model Tema Antarmuka
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      currentTheme === t.id
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {currentTheme === t.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Reset Demo Data */}
        <button
          onClick={onResetData}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title="Reset Data ke Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
