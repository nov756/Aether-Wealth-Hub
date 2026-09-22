import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Repeat,
  Bell,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CurrencyConfig, FinancialCalendarPlan, PlanCategory, PlanRecurrence } from '../types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: FinancialCalendarPlan, syncDirectly: boolean) => void;
  editingPlan?: FinancialCalendarPlan | null;
  currency: CurrencyConfig;
  isCalendarConnected: boolean;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPlan,
  currency,
  isCalendarConnected,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanCategory>('Review');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [recurrence, setRecurrence] = useState<PlanRecurrence>('monthly');
  const [reminderMinutes, setReminderMinutes] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [syncDirectly, setSyncDirectly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPlan) {
      setTitle(editingPlan.title);
      setCategory(editingPlan.category);
      setTargetAmount(
        editingPlan.targetAmount
          ? (editingPlan.targetAmount * currency.rateFromUSD).toString()
          : ''
      );
      setTargetDate(editingPlan.targetDate);
      setStartTime(editingPlan.startTime || '09:00');
      setEndTime(editingPlan.endTime || '10:00');
      setRecurrence(editingPlan.recurrence || 'monthly');
      setReminderMinutes(editingPlan.reminderMinutes || 60);
      setDescription(editingPlan.description || '');
      setSyncDirectly(isCalendarConnected && !editingPlan.googleEventId);
    } else {
      // Default to next upcoming payday or next 3 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      setTitle('');
      setCategory('Review');
      setTargetAmount('');
      setTargetDate(`${yyyy}-${mm}-${dd}`);
      setStartTime('09:00');
      setEndTime('10:00');
      setRecurrence('monthly');
      setReminderMinutes(60);
      setDescription('');
      setSyncDirectly(isCalendarConnected);
    }
    setError(null);
  }, [editingPlan, isOpen, isCalendarConnected, currency.rateFromUSD]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul rencana keuangan wajib diisi.');
      return;
    }
    if (!targetDate) {
      setError('Tanggal jadwal wajib dipilih.');
      return;
    }

    const numericAmount = targetAmount ? parseFloat(targetAmount) / currency.rateFromUSD : undefined;

    const planToSave: FinancialCalendarPlan = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || `Rencana finansial kategori ${category} via Aether Wealth.`,
      targetAmount: numericAmount && numericAmount > 0 ? numericAmount : undefined,
      targetDate,
      startTime,
      endTime,
      recurrence,
      reminderMinutes,
      googleEventId: editingPlan?.googleEventId,
      googleEventLink: editingPlan?.googleEventLink,
      syncedAt: editingPlan?.syncedAt,
      status: editingPlan?.status || 'planned',
    };

    onSave(planToSave, syncDirectly);
    onClose();
  };

  const categories: { id: PlanCategory; label: string; desc: string }[] = [
    { id: 'Review', label: 'Evaluasi & Audit', desc: 'Review gaji, audit pengeluaran mingguan/bulanan' },
    { id: 'Savings', label: 'Tabungan', desc: 'Transfer dana darurat & tabungan jangka pendek' },
    { id: 'Investment', label: 'Investasi (DCA)', desc: 'Setoran rutin ETF, saham, reksadana' },
    { id: 'Bills', label: 'Tagihan & Langganan', desc: 'Bayar listrik, kartu kredit, sewa, asuransi' },
    { id: 'Debt', label: 'Pelunasan Utang', desc: 'Jadwal cicilan & strategi debt snowball' },
    { id: 'FIRE', label: 'Milestone FIRE', desc: 'Review tahunan/kuartalan target pensiun dini' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl relative my-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
              {editingPlan ? 'Edit Jadwal Rencana Finansial' : 'Ajuin Plan Finansial Baru'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sinkronkan rencana budgeting & investasi langsung ke Google Calendar
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Judul Rencana */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Nama Rencana / Agenda <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Alokasi Gaji 50/30/20 & Top Up Bibit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Kategori Finansial */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Kategori Finansial</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    category === c.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="text-xs">{c.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Nominal & Tanggal Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target Nominal ({currency.symbol})</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Opsional, misal: 2500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tanggal Acara <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Jam Mulai</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Jam Selesai</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Frekuensi Pengulangan & Pengingat Notifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-sky-600" />
                <span>Frekuensi Pengulangan</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as PlanRecurrence)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="once">Sekali Saja (Non-rekuren)</option>
                <option value="weekly">Tiap Minggu</option>
                <option value="monthly">Tiap Bulan (Rekomendasi Gajian)</option>
                <option value="yearly">Tiap Tahun (Pajak/Audit)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Pengingat Kalender</span>
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="15">15 menit sebelum acara</option>
                <option value="30">30 menit sebelum acara</option>
                <option value="60">1 jam sebelum acara</option>
                <option value="120">2 jam sebelum acara</option>
                <option value="1440">1 hari sebelumnya (H-1)</option>
              </select>
            </div>
          </div>

          {/* Deskripsi & Checklist Plan */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Catatan & Langkah Eksekusi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan detail: misal rekening tujuan, link aplikasi perbankan, rasio pembagian..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Google Calendar Sync Option */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={syncDirectly}
                onChange={(e) => setSyncDirectly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-left">
                <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kirim & sinkronkan langsung ke Google Calendar</span>
                </span>
                <p className="text-[11px] text-indigo-700 font-medium">
                  {isCalendarConnected
                    ? 'Acara akan otomatis ditambahkan ke kalender utama Google Anda lengkap dengan pengingat notifikasi.'
                    : 'Sambungkan Google Calendar Anda untuk membuat agenda otomatis di akun Google.'}
                </p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingPlan ? 'Perbarui Plan' : 'Ajuin & Simpan Plan'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
