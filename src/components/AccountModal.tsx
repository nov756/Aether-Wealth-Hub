import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { AccountType, CurrencyConfig } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onSave: (acc: {
    name: string;
    type: AccountType;
    balanceUSD: number;
    institution: string;
  }) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Bank');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance);
    if (!name.trim() || isNaN(bal)) return;

    onSave({
      name: name.trim(),
      type,
      balanceUSD: bal / currency.rateFromUSD,
      institution: institution.trim() || 'Bank Rekanan',
    });
    onClose();
    setName('');
    setBalance('');
    setInstitution('');
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
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Tambah Rekening / Akun</h3>
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
            <label className="block text-slate-600 font-bold mb-1">Nama Akun / Rekening</label>
            <input
              type="text"
              required
              placeholder="cth. Tabungan BCA Payroll / Bibit Reksa Dana"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Tipe Akun</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Bank">Bank Account</option>
                <option value="E-Wallet">E-Wallet (Dompet Digital)</option>
                <option value="Investment">Investasi (Saham / Reksadana)</option>
                <option value="Cash">Cash / Dana Darurat</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Saldo Awal ({currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Nama Institusi / Penyedia</label>
            <input
              type="text"
              placeholder="cth. Bank BCA, Mandiri, Bibit, GoPay"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
