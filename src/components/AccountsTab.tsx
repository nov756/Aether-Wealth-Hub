import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  Coins,
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  CreditCard,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Account, AccountType, CurrencyConfig } from '../types';
import { formatMoney } from '../utils/formatters';

interface AccountsTabProps {
  accounts: Account[];
  currency: CurrencyConfig;
  onOpenAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
  onUpdateBalance: (id: string, newBalanceUSD: number) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  currency,
  onOpenAddAccount,
  onDeleteAccount,
  onUpdateBalance,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'Bank':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'Cash':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Investment':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      case 'E-Wallet':
        return <Smartphone className="w-5 h-5 text-amber-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: AccountType) => {
    switch (type) {
      case 'Bank':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cash':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Investment':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'E-Wallet':
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const liquidCash = accounts
    .filter((a) => a.type === 'Bank' || a.type === 'Cash' || a.type === 'E-Wallet')
    .reduce((sum, a) => sum + a.balance, 0);
  const investmentBalance = accounts
    .filter((a) => a.type === 'Investment')
    .reduce((sum, a) => sum + a.balance, 0);

  const filteredAccounts =
    filterType === 'All'
      ? accounts
      : accounts.filter((a) => a.type === filterType);

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    // show local currency amount in the input for convenience
    setEditValue(Math.round(acc.balance * currency.rateFromUSD).toString());
  };

  const saveEdit = (accId: string) => {
    const numeric = parseFloat(editValue);
    if (!isNaN(numeric) && numeric >= 0) {
      const inUSD = numeric / currency.rateFromUSD;
      onUpdateBalance(accId, inUSD);
    }
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Matriks Akun & Portofolio Kekayaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola saldo lintas Rekening Bank, Dompet Digital, dan Reksa Dana / ETF
          </p>
        </div>
        <button
          onClick={onOpenAddAccount}
          className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Total Seluruh Portofolio
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatMoney(totalBalance, currency)}
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 mt-1 block">
            {accounts.length} rekening terhubung
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Likuiditas & Kas Tersedia
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatMoney(liquidCash, currency)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            {totalBalance > 0 ? ((liquidCash / totalBalance) * 100).toFixed(1) : 0}% dari total
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Aset Investasi Berbunga
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {formatMoney(investmentBalance, currency)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            {totalBalance > 0 ? ((investmentBalance / totalBalance) * 100).toFixed(1) : 0}% dari total
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Bank', 'E-Wallet', 'Investment', 'Cash'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === t
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t === 'All' ? 'Semua Kategori' : t}
          </button>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isEditing = editingId === acc.id;
          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-indigo-200 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {acc.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeColor(
                            acc.type
                          )}`}
                        >
                          {acc.type}
                        </span>
                        {acc.accountNumberMask && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {acc.accountNumberMask}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    title="Hapus Akun"
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {acc.institution && (
                  <p className="text-[11px] text-slate-500 font-medium mb-3">
                    Institusi: <span className="text-slate-700">{acc.institution}</span>
                  </p>
                )}
              </div>

              {/* Balance & Inline Adjuster */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Saldo Tersedia
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 border border-indigo-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(acc.id)}
                      className="text-xs font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs font-semibold px-2 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {formatMoney(acc.balance, currency)}
                    </div>
                    <button
                      onClick={() => startEdit(acc)}
                      title="Sesuaikan Saldo"
                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 p-1 rounded-md hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
