import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Account, BudgetPillar, CurrencyConfig, Transaction, TransactionType } from '../types';
import { formatMoney } from '../utils/formatters';

interface TransactionsTabProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: CurrencyConfig;
  onOpenAddTransaction: (type: TransactionType) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  accounts,
  currency,
  onOpenAddTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<'all' | BudgetPillar>('all');

  // Filter logic
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesPillar = pillarFilter === 'all' || t.pillar === pillarFilter;

    return matchesSearch && matchesType && matchesCat && matchesPillar;
  });

  // Totals for filtered set
  const totalIn = filtered
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const net = totalIn - totalOut;

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const exportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Deskripsi', 'Kategori', 'Pilar Anggaran', 'Tipe', 'Jumlah (USD)', 'Akun'];
    const rows = filtered.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      return [
        t.id,
        t.date,
        `"${t.desc.replace(/"/g, '""')}"`,
        t.category,
        t.pillar,
        t.type,
        t.amount,
        `"${acc ? acc.name : ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aether-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <ReceiptText className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Riwayat Transaksi & Arus Kas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lacak seluruh pemasukan dan pengeluaran secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Summary Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Masuk</span>
              <span className="text-sm font-black text-emerald-600">
                +{formatMoney(totalIn, currency)}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {filtered.filter((t) => t.type === 'income').length} transaksi
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Keluar</span>
              <span className="text-sm font-black text-rose-600">
                -{formatMoney(totalOut, currency)}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {filtered.filter((t) => t.type === 'expense').length} transaksi
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Selisih Bersih</span>
            <span
              className={`text-sm font-black ${
                net >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {net >= 0 ? '+' : ''}
              {formatMoney(net, currency)}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {filtered.length} transaksi ditampilkan
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Select Type */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan Saja</option>
              <option value="expense">Pengeluaran Saja</option>
            </select>

            {/* Select Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Select Pillar */}
            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Semua Aturan 50/30/20</option>
              <option value="Needs">Needs (Kebutuhan)</option>
              <option value="Wants">Wants (Keinginan)</option>
              <option value="Savings">Savings (Tabungan)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Deskripsi</th>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold">Pilar (50/30/20)</th>
                <th className="px-4 py-3 font-bold">Rekening</th>
                <th className="px-4 py-3 font-bold text-right">Nominal</th>
                <th className="px-4 py-3 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria pencarian
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const acc = accounts.find((a) => a.id === t.accountId);
                  const isInc = t.type === 'income';

                  let pillarBadge = 'bg-slate-100 text-slate-600';
                  if (t.pillar === 'Needs') pillarBadge = 'bg-sky-50 text-sky-700 border-sky-200';
                  if (t.pillar === 'Wants') pillarBadge = 'bg-violet-50 text-violet-700 border-violet-200';
                  if (t.pillar === 'Savings') pillarBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {t.desc}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[10px]">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${pillarBadge}`}>
                          {t.pillar}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-medium">
                        {acc ? acc.name : 'Rekening Utama'}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-black text-sm whitespace-nowrap ${
                          isInc ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isInc ? '+' : '-'}
                        {formatMoney(t.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          title="Hapus Transaksi"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
