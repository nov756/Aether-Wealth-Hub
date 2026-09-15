import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Account,
  BudgetPillar,
  CurrencyConfig,
  TransactionCategory,
  TransactionType,
} from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: TransactionType;
  accounts: Account[];
  currency: CurrencyConfig;
  onSave: (tx: {
    desc: string;
    amountUSD: number;
    category: TransactionCategory;
    pillar: BudgetPillar;
    type: TransactionType;
    accountId: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType,
  accounts,
  currency,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Groceries');
  const [pillar, setPillar] = useState<BudgetPillar>('Needs');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !desc.trim()) return;

    // Convert to base USD
    const inUSD = val / currency.rateFromUSD;
    onSave({
      desc: desc.trim(),
      amountUSD: inUSD,
      category,
      pillar,
      type,
      accountId: accountId || accounts[0]?.id,
    });
    onClose();
    setDesc('');
    setAmount('');
  };

  const categories: TransactionCategory[] = [
    'Salary',
    'Freelance',
    'Investments',
    'Housing',
    'Groceries',
    'Food & Dining',
    'Transport',
    'Subscriptions',
    'Entertainment',
    'Health',
    'Shopping',
    'Utilities',
    'Others',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-xl ${
                type === 'income'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {type === 'income' ? (
                <PlusCircle className="w-5 h-5" />
              ) : (
                <MinusCircle className="w-5 h-5" />
              )}
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              {type === 'income' ? 'Catat Pemasukan Baru' : 'Catat Pengeluaran Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Segmented Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setPillar('Needs');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran (-)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setPillar('Savings');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan (+)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Deskripsi Transaksi</label>
            <input
              type="text"
              required
              placeholder="cth. Belanja Supermarket / Bonus Freelance"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Nominal ({currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Pilar 50/30/20</label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as BudgetPillar)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Needs">Needs (Kebutuhan 50%)</option>
                <option value="Wants">Wants (Keinginan 30%)</option>
                <option value="Savings">Savings (Tabungan 20%)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Rekening / Akun</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
