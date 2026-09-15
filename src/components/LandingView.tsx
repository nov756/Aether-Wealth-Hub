import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Play,
  HeartPulse,
  Flame,
  PieChart,
  Wallet,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Layers,
  Zap,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { CurrencyConfig } from '../types';
import { formatMoney } from '../utils/formatters';

interface LandingViewProps {
  currency: CurrencyConfig;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onDemoLogin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  currency,
  onOpenRegister,
  onOpenLogin,
  onDemoLogin,
}) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-7 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>The #1 All-In-One Financial OS Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]"
        >
          Kuasai Keuanganmu dengan{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Aether OS
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Sistem perencanaan keuangan terlengkap dengan kecerdasan kalkulasi real-time. Kelola alokasi 50/30/20, monitor investasi multi-rekening, hingga simulasi bebas finansial (FIRE).
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
        >
          <button
            id="landing-cta-register"
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Mulai Sekarang - Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="landing-cta-demo"
            onClick={onDemoLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-sm shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Coba Demo Interaktif</span>
          </button>
        </motion.div>

        {/* Value Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 pt-4 text-xs font-semibold text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tanpa Biaya Langganan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Penyimpanan Lokal Privat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kaidah FIRE Trinity 4%</span>
          </div>
        </motion.div>
      </section>

      {/* Live Interactive Preview Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="max-w-5xl mx-auto px-4"
      >
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Live Preview
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Tampilan Bersih & Interaktif Aether OS
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh metrik dan kalkulasi langsung responsif terhadap perubahan data Anda.
              </p>
            </div>
            <button
              onClick={onDemoLogin}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Buka Dashboard Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Skor Kesehatan</span>
                <HeartPulse className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">88 <span className="text-xs text-emerald-600 font-bold">/ 100 (Sangat Sehat)</span></div>
              <p className="text-[11px] text-slate-500">Dana darurat aman 7.4 bulan pengeluaran</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Kekayaan (Net Worth)</span>
                <Wallet className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatMoney(9820, currency)}
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">+5.4% pertumbuhan aset bulan ini</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Estimasi Pensiun Dini</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">9.4 Tahun Lagi</div>
              <p className="text-[11px] text-slate-500">Berdasarkan investasi rutin bulanan Anda</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Showcase Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tiga Pilar Utama Finansial Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Didesain khusus untuk efisiensi, kejelasan arah finansial, dan kedisiplinan menabung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Health Score */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-200/60">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Smart Health Score</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluasi otomatis tingkat keamanan finansialmu dari skor 0-100 berdasarkan rasio dana darurat, beban cicilan, dan surplus arus kas bersih tiap bulan.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Gauge radial interaktif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 2: FIRE Simulator */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold border border-amber-200/60">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">FIRE Retirement Sim</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulasikan potensi pensiun dini secara presisi. Hitung kapan kamu mencapai kebebasan finansial berdasarkan prinsip compounding interest dan 4% Trinity Rule.
            </p>
            <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
              <span>Slider kurva pertumbuhan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 3: 50/30/20 Rule */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold border border-indigo-200/60">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">50/30/20 Auto Allocator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Disiplin anggaran tanpa ribet. Pengelompokan otomatis pengeluaran Kebutuhan (Needs), Keinginan (Wants), dan Tabungan (Savings) dengan peringatan dini jika overbudget.
            </p>
            <div className="pt-2 text-xs font-bold text-indigo-700 flex items-center gap-1">
              <span>Alokasi otomatis cerdas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight">
              Siap Mengambil Kendali Penuh Atas Uangmu?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              Gabung ribuan perencana mandiri yang menggunakan Aether OS untuk mencapai tujuan finansial lebih cepat.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              Daftar Akun Baru
            </button>
            <button
              onClick={onOpenLogin}
              className="px-5 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-500/50 transition-all cursor-pointer"
            >
              Masuk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
