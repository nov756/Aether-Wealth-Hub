import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  Menu,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  X,
  CalendarCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyStreakState, TabType } from '../types';

interface MobileBottomBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSidebar: () => void;
  onOpenTransaction: (type: 'income' | 'expense') => void;
  streak: DailyStreakState;
  onCheckInStreak: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSidebar,
  onOpenTransaction,
  streak,
  onCheckInStreak,
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setQuickMenuOpen(false);
  };

  return (
    <>
      {/* Quick Action One-Hand Speed Sheet for Mobile */}
      <AnimatePresence>
        {quickMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setQuickMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
            />

            {/* Floating Thumb Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed bottom-22 left-4 right-4 z-50 lg:hidden max-w-sm mx-auto bg-white rounded-3xl p-4 shadow-2xl border border-slate-200/90"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Aksi Cepat Finansial
                  </span>
                </div>
                <button
                  onClick={() => setQuickMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Catat Pengeluaran */}
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenTransaction('expense');
                  }}
                  className="p-3.5 rounded-2xl bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200 text-left transition-all active:scale-97 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs text-rose-900">
                    Pengeluaran
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Belanja, tagihan & jajan
                  </div>
                </button>

                {/* Catat Pemasukan */}
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenTransaction('income');
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200 text-left transition-all active:scale-97 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs text-emerald-900">
                    Pemasukan
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    Gaji, profit & dividen
                  </div>
                </button>
              </div>

              {/* Streak Check-in One-Thumb Button */}
              <div className="mt-2.5 space-y-2">
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    handleSelectTab('calendar');
                  }}
                  className="w-full p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-extrabold leading-tight">Ajuin Plan Google Kalender</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Jadwalkan review gaji & investasi</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-indigo-700 shadow-2xs">
                    Buka
                  </span>
                </button>

                {!streak.checkedInToday ? (
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onCheckInStreak();
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-105 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 fill-white text-white animate-pulse" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black leading-tight">
                          Klaim Streak Harian
                        </span>
                        <span className="text-[10px] text-orange-100 font-medium">
                          {streak.streakCount} Hari Aktif • Check-in Sekarang
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white text-orange-600">
                      Check-in
                    </span>
                  </button>
                ) : (
                  <div className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span>Streak Hari Ini Telah Tercatat ({streak.streakCount} Hari)</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Selesai
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav
        aria-label="Navigasi Bawah Seluler"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden px-3 pt-2 pb-safe"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1 pb-1">
          {/* Tab 1: Ringkasan */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Ringkasan</span>
          </button>

          {/* Tab 2: Akun */}
          <button
            onClick={() => handleSelectTab('accounts')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeTab === 'accounts'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === 'accounts' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Akun</span>
          </button>

          {/* CENTER HERO BUTTON: One-Hand Thumb Action */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="relative w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-500/35 border-2 border-white active:scale-95 transition-all cursor-pointer group"
              aria-label="Buka Menu Aksi Cepat"
            >
              <motion.div
                animate={{ rotate: quickMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </motion.div>
              <span className="sr-only">Catat Transaksi</span>

              {/* Unclaimed streak reminder dot */}
              {!streak.checkedInToday && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
              )}
            </button>
          </div>

          {/* Tab 3: Alokasi Anggaran */}
          <button
            onClick={() => handleSelectTab('budgeting')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeTab === 'budgeting'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === 'budgeting' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Anggaran</span>
          </button>

          {/* Tab 4: Menu Slide-over Sidebar Trigger */}
          <button
            onClick={onOpenSidebar}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer min-h-[48px] relative"
            aria-label="Buka Semua Fitur dan Pengaturan"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">Fitur</span>

            {/* Streak count pill on menu button */}
            {streak.streakCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
