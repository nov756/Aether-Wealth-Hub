import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { CurrencyConfig } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onSave: (sub: {
    name: string;
    costUSD: number;
    dueDate: string;
    category: string;
    iconName: string;
  }) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [dueDate, setDueDate] = useState('Tiap tgl 15');
  const [category, setCategory] = useState('Langganan Digital');
  const [iconName, setIconName] = useState('Tv');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cVal = parseFloat(cost);
    if (!name.trim() || isNaN(cVal) || cVal <= 0) return;

    onSave({
      name: name.trim(),
      costUSD: cVal / currency.rateFromUSD,
      dueDate: dueDate.trim() || 'Tiap bulan',
      category,
      iconName,
    });
    onClose();
    setName('');
    setCost('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Tambah Tagihan / Langganan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Nama Layanan / Tagihan</label>
            <input
              type="text"
              required
              placeholder="cth. Disney+ Hotstar / Spotify / Tagihan Listrik"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Biaya Bulanan ({currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Jadwal Penagihan</label>
              <input
                type="text"
                placeholder="cth. Tiap tgl 20"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Kategori</label>
              <input
                type="text"
                placeholder="Hiburan / Software / Gym"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Ikon Layanan</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Tv">Streaming TV / Film</option>
                <option value="Music">Musik & Audio</option>
                <option value="Dumbbell">Gym & Olahraga</option>
                <option value="Bot">AI & Produktivitas</option>
                <option value="Cloud">Cloud Storage</option>
                <option value="Code">Developer Software</option>
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
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-600/20 transition-all cursor-pointer active:scale-95"
            >
              Simpan Tagihan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
