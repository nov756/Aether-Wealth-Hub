import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { CurrencyConfig } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onSave: (goal: {
    name: string;
    targetUSD: number;
    currentUSD: number;
    category: string;
    deadline: string;
    iconName: string;
  }) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [category, setCategory] = useState('Keamanan Finansial');
  const [deadline, setDeadline] = useState('Des 2027');
  const [iconName, setIconName] = useState('Shield');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tVal = parseFloat(target);
    const cVal = parseFloat(current) || 0;
    if (!name.trim() || isNaN(tVal) || tVal <= 0) return;

    onSave({
      name: name.trim(),
      targetUSD: tVal / currency.rateFromUSD,
      currentUSD: cVal / currency.rateFromUSD,
      category,
      deadline,
      iconName,
    });
    onClose();
    setName('');
    setTarget('');
    setCurrent('0');
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
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Target className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Tambah Target Tabungan</h3>
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
            <label className="block text-slate-600 font-bold mb-1">Nama Target Tabungan</label>
            <input
              type="text"
              required
              placeholder="cth. Liburan Keluarga / DP Rumah Impian"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Target Nominal ({currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Saldo Awal ({currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Target Tenggat Waktu</label>
              <input
                type="text"
                placeholder="cth. Des 2027"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Ikon Target</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Shield">Perisai (Dana Darurat)</option>
                <option value="Car">Mobil / Kendaraan</option>
                <option value="Plane">Pesawat (Liburan)</option>
                <option value="Home">Rumah / Properti</option>
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
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
