import React, { useState } from 'react';
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Target,
  Plus,
  Tv,
  Music,
  Dumbbell,
  Bot,
  Cloud,
  Code,
  Shield,
  Car,
  Plane,
  Home,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CurrencyConfig, SavingsGoal, Subscription, Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface BudgetingTabProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  currency: CurrencyConfig;
  onOpenAddGoal: () => void;
  onOpenAddSub: () => void;
  onToggleSubscription: (id: string) => void;
  onDepositGoal: (goalId: string, amountUSD: number) => void;
}

export const BudgetingTab: React.FC<BudgetingTabProps> = ({
  transactions,
  goals,
  subscriptions,
  currency,
  onOpenAddGoal,
  onOpenAddSub,
  onToggleSubscription,
  onDepositGoal,
}) => {
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('500');

  // Total Income
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const baseIncome = totalIncome > 0 ? totalIncome : 8500;

  // 50 / 30 / 20 Targets
  const targetNeeds = baseIncome * 0.5;
  const targetWants = baseIncome * 0.3;
  const targetSavings = baseIncome * 0.2;

  // Actual Spend from transactions
  const spentNeeds = transactions
    .filter((t) => t.pillar === 'Needs' && t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const spentWants = transactions
    .filter((t) => t.pillar === 'Wants' && t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const spentSavings = transactions
    .filter((t) => t.pillar === 'Savings' && t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const needsPct = targetNeeds > 0 ? (spentNeeds / targetNeeds) * 100 : 0;
  const wantsPct = targetWants > 0 ? (spentWants / targetWants) * 100 : 0;
  const savingsPct = targetSavings > 0 ? (spentSavings / targetSavings) * 100 : 0;

  const isWantsOver = spentWants > targetWants;

  const handleQuickDeposit = (goal: SavingsGoal) => {
    const amt = parseFloat(depositAmount) / currency.rateFromUSD;
    if (!isNaN(amt) && amt > 0) {
      onDepositGoal(goal.id, amt);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setDepositGoalId(null);
    }
  };

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-violet-600" />;
      case 'Home':
        return <Home className="w-5 h-5 text-amber-600" />;
      default:
        return <Shield className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getSubIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="w-4 h-4 text-rose-500" />;
      case 'Music':
        return <Music className="w-4 h-4 text-emerald-500" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-amber-500" />;
      case 'Bot':
        return <Bot className="w-4 h-4 text-indigo-500" />;
      case 'Cloud':
        return <Cloud className="w-4 h-4 text-sky-500" />;
      default:
        return <Code className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 50/30/20 Engine Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <PieChart className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Alokasi Anggaran 50 / 30 / 20
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Disiplin keuangan otomatis berdasarkan basis pemasukan bulanan (
              <strong className="text-slate-800 font-bold">{formatMoney(baseIncome, currency)}</strong>)
            </p>
          </div>

          <div>
            {isWantsOver ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Pengeluaran Keinginan Melebihi Batas!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Anggaran Terkendali Seimbang</span>
              </span>
            )}
          </div>
        </div>

        {/* 3 Pillars Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Needs (50%) */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kebutuhan Pokok
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Sewa, Listrik, Makanan Pokok, Utilitas
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Target 50%
                </span>
              </div>
              <div className="my-4">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatMoney(spentNeeds, currency)}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Batas Maksimal: <strong className="text-slate-800">{formatMoney(targetNeeds, currency)}</strong>
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-500">Terpakai</span>
                <span className="text-sky-600 font-bold">{needsPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(needsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pillar 2: Wants (30%) */}
          <div
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-colors ${
              isWantsOver
                ? 'bg-rose-50/40 border-rose-300'
                : 'bg-slate-50/70 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Keinginan & Lifestyle
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Restoran, Langganan, Hobi, Hiburan
                  </span>
                </div>
                <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full border border-violet-200">
                  Target 30%
                </span>
              </div>
              <div className="my-4">
                <div
                  className={`text-2xl font-black tracking-tight ${
                    isWantsOver ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatMoney(spentWants, currency)}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Batas Maksimal: <strong className="text-slate-800">{formatMoney(targetWants, currency)}</strong>
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-500">Terpakai</span>
                <span className={`font-bold ${isWantsOver ? 'text-rose-600' : 'text-violet-600'}`}>
                  {wantsPct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isWantsOver ? 'bg-rose-500' : 'bg-violet-500'
                  }`}
                  style={{ width: `${Math.min(wantsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pillar 3: Savings & Wealth (20%) */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tabungan & Investasi
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    ETF Pasar Modal, Tabungan Pensiun
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Target 20%
                </span>
              </div>
              <div className="my-4">
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  {formatMoney(spentSavings, currency)}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Target Minimal: <strong className="text-slate-800">{formatMoney(targetSavings, currency)}</strong>
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-500">Pencapaian</span>
                <span className="text-emerald-600 font-bold">{savingsPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(savingsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals & Active Subscriptions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Goals Milestones */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Target className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Target Tabungan & Milestone
                </h3>
              </div>
              <button
                onClick={onOpenAddGoal}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Target</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {goals.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Belum ada target tabungan yang dibuat.
                  </p>
                  <button
                    onClick={onOpenAddGoal}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Buat Target Tabungan Pertama
                  </button>
                </div>
              ) : (
                goals.map((g) => {
                const pct = Math.min(Number(((g.current / g.target) * 100).toFixed(1)), 100);
                const isCompleted = pct >= 100;

                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {getGoalIcon(g.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {g.name}
                            </h4>
                            {isCompleted && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                Tercapai!
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {g.category} {g.deadline ? `• Target: ${g.deadline}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900">
                          {formatMoney(g.current, currency)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          dari {formatMoney(g.target, currency)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progres: {pct}%</span>
                        <button
                          onClick={() => setDepositGoalId(g.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          + Setor Tabungan
                        </button>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Deposit Inline Form */}
                    {depositGoalId === g.id && (
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Jumlah setor"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleQuickDeposit(g)}
                          className="text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shrink-0"
                        >
                          Setor!
                        </button>
                        <button
                          onClick={() => setDepositGoalId(null)}
                          className="text-xs font-semibold px-2 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Subscription Guard */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pelindung Tagihan & Langganan
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau tagihan berulang agar tidak bocor halus
                </p>
              </div>
              <button
                onClick={onOpenAddSub}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tagihan</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {subscriptions.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Belum ada langganan atau tagihan rutin.
                  </p>
                  <button
                    onClick={onOpenAddSub}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    + Catat Tagihan Rutin
                  </button>
                </div>
              ) : (
                subscriptions.map((sub) => {
                return (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      sub.active
                        ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-100/50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        {getSubIcon(sub.iconName)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {sub.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.category} • {sub.dueDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatMoney(sub.cost, currency)}
                        <span className="text-[10px] font-normal text-slate-400 block">/bulan</span>
                      </div>

                      {/* Active Toggle */}
                      <button
                        onClick={() => onToggleSubscription(sub.id)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          sub.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={sub.active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            sub.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
