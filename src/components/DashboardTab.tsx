import React from 'react';
import {
  Vault,
  ArrowUpDown,
  ShieldCheck,
  Flag,
  ArrowUpRight,
  TrendingUp,
  HeartPulse,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Account,
  CurrencyConfig,
  FIREParams,
  SavingsGoal,
  Subscription,
  TabType,
  Transaction,
} from '../types';
import { calculateFIRE, calculateHealthScore, formatMoney } from '../utils/formatters';
import { CashflowTrendChart } from './CashflowTrendChart';
import { AssetAllocationChart } from './AssetAllocationChart';

interface DashboardTabProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  fireParams: FIREParams;
  currency: CurrencyConfig;
  setActiveTab: (tab: TabType) => void;
  onOpenTransaction: (type: 'income' | 'expense') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  accounts,
  transactions,
  goals,
  subscriptions,
  fireParams,
  currency,
  setActiveTab,
  onOpenTransaction,
}) => {
  // 1. Calculate Balances
  const netWorth = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const liquidCash = accounts
    .filter((a) => a.type === 'Bank' || a.type === 'Cash' || a.type === 'E-Wallet')
    .reduce((sum, acc) => sum + Number(acc.balance), 0);
  const investments = accounts
    .filter((a) => a.type === 'Investment')
    .reduce((sum, acc) => sum + Number(acc.balance), 0);

  // 2. Cashflow
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // 3. Subscriptions
  const activeSubs = subscriptions.filter((s) => s.active);
  const totalMonthlySubs = activeSubs.reduce((sum, s) => sum + Number(s.cost), 0);
  const nextSub = activeSubs[0];

  // 4. Health Score Calculation
  const health = calculateHealthScore(
    liquidCash,
    totalExpense,
    savingsRate,
    investments,
    netWorth
  );

  // 5. FIRE Engine
  const fire = calculateFIRE(
    netWorth,
    fireParams.monthly,
    fireParams.annualReturn,
    fireParams.desiredMonthlySpend
  );

  // Circular gauge parameters
  const strokeDash = 251.2;
  const strokeOffset = strokeDash - (strokeDash * health.score) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Banner / Greeting */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 border border-indigo-100 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Pusat Kendali Keuangan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang di Portofolio Finansial Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Arus kas Anda berada pada laju tabungan{' '}
            <strong className="text-emerald-700 font-bold">{savingsRate.toFixed(1)}%</strong>.
            Target kebebasan finansial Anda diproyeksikan tercapai dalam kurun waktu{' '}
            <strong className="text-indigo-700 font-bold">{fire.yearsToFIRE.toFixed(1)} Tahun</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenTransaction('expense')}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            + Catat Pengeluaran
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>Simulasi FIRE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Section: Health Score + 4 Key Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Score Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Skor Kesehatan Finansial
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{health.status}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>

          {/* Animated Circular Gauge */}
          <div className="my-5 flex items-center justify-center relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {health.score}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  dari 100
                </span>
              </div>
            </div>
          </div>

          {/* Health Factors */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Cadangan Dana Darurat:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {health.emergencyMonths} Bulan ({health.emergencyStatus})
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Rasio Tabungan:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Beban Cicilan / DTI:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Aman & Rendah
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Net Worth Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Kekayaan Bersih
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Vault className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {formatMoney(netWorth, currency)}
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2% pertumbuhan bulan ini</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>
                Kas Cair:{' '}
                <strong className="text-slate-800 font-bold">
                  {formatMoney(liquidCash, currency)}
                </strong>
              </span>
              <span>
                Investasi:{' '}
                <strong className="text-indigo-700 font-bold">
                  {formatMoney(investments, currency)}
                </strong>
              </span>
            </div>
          </div>

          {/* Cashflow Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Arus Kas Bulanan
              </span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div
                className={`text-2xl lg:text-3xl font-black tracking-tight ${
                  netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatMoney(netSavings, currency)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Masuk:{' '}
                <span className="text-emerald-600 font-bold">
                  {formatMoney(totalIncome, currency)}
                </span>{' '}
                | Keluar:{' '}
                <span className="text-rose-600 font-bold">
                  {formatMoney(totalExpense, currency)}
                </span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                <span>Rasio Tabungan</span>
                <span className="text-indigo-700 font-bold">{savingsRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subscription Guard Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Beban Tetap & Langganan
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatMoney(totalMonthlySubs, currency)}
                <span className="text-xs font-normal text-slate-500">/bulan</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-amber-700 font-bold">{activeSubs.length} Layanan Aktif</span>{' '}
                diawasi sistem
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Jatuh Tempo:</span>
              <span className="text-indigo-700 font-semibold text-[11px] truncate max-w-[170px]">
                {nextSub ? `${nextSub.name} (${nextSub.dueDate})` : 'Tidak ada tagihan'}
              </span>
            </div>
          </div>

          {/* FIRE Freedom Index Card */}
          <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-white shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Indeks Kebebasan (FIRE)
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Flag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-700 tracking-tight">
                {fire.yearsToFIRE.toFixed(1)} Tahun
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Estimasi Tahun Bebas:{' '}
                <span className="font-bold text-slate-900">{fire.targetYear}</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                <span>Target: {formatMoney(fire.targetFIRENumber, currency)}</span>
                <span className="text-indigo-700 font-bold">{fire.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${fire.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowTrendChart currency={currency} transactions={transactions} />
        </div>
        <div className="lg:col-span-1">
          <AssetAllocationChart accounts={accounts} currency={currency} />
        </div>
      </div>

      {/* Recent Activity Mini Feed */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Transaksi Terkini
            </h3>
            <p className="text-xs text-slate-500">Arus kas terbaru yang tercatat di rekening</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {transactions.slice(0, 4).map((tx) => {
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isInc = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      isInc
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isInc ? '+' : '-'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{tx.desc}</div>
                    <div className="text-[11px] text-slate-400">
                      {tx.date} • {tx.category} • {acc ? acc.name : 'Akun Utama'}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-right font-extrabold text-sm ${
                    isInc ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {isInc ? '+' : '-'}
                  {formatMoney(tx.amount, currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
