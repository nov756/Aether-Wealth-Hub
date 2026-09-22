import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Flame,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { AIAnalystData, CurrencyConfig, Transaction } from '../types';

interface AIFinancialAnalystProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  summary: {
    netWorth: number;
    liquidCash: number;
    totalIncome: number;
    totalExpense: number;
    savingsRate: number;
  };
}

export const AIFinancialAnalyst: React.FC<AIFinancialAnalystProps> = ({
  transactions,
  currency,
  summary,
}) => {
  const [data, setData] = useState<AIAnalystData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations'>('insights');
  const [source, setSource] = useState<string>('gemini-3.8-flash');

  // Filter 30 days transactions for client-side stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const txCount30Days = transactions.filter((t) => {
    if (!t.date) return true;
    const d = new Date(t.date);
    return isNaN(d.getTime()) ? true : d >= thirtyDaysAgo;
  }).length;

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-financial-analyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          currency,
          summary,
          daysRange: 30,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}: Gagal memuat analisis.`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
        setSource(result.source || 'gemini-3.8-flash');
        setLastAnalyzed(
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      } else {
        throw new Error(result.error || 'Data analisis tidak tersedia.');
      }
    } catch (err: any) {
      console.error('Fetch AI Analyst error:', err);
      setError(err.message || 'Terjadi kendala saat memproses Gemini AI.');
    } finally {
      setLoading(false);
    }
  }, [transactions, currency, summary]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden transition-colors">
      {/* Decorative gradient highlight on top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                AI Financial Analyst
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-indigo-600" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Diagnosis & ringkasan insight transaksi {txCount30Days} mutasi dalam 30 hari terakhir
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {lastAnalyzed && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Diperbarui: {lastAnalyzed}
            </span>
          )}
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5 border border-slate-200"
            title="Muat ulang analisis transaksi terbaru"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{loading ? 'Menganalisis...' : 'Pindai Ulang'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton with Motion Pulse */
        <div className="py-8 space-y-4">
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-indigo-600">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Menganalisis pola transaksi & arus kas 30 hari dengan Gemini AI...</span>
          </div>

          <div className="h-16 bg-slate-100/70 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 bg-slate-100/70 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-100/70 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-100/70 rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : error ? (
        /* Error State with Retry Button */
        <div className="py-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto">
            <p className="text-xs font-bold text-slate-800">Gagal Memproses Analisis Gemini</p>
            <p className="text-[11px] text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchAnalysis}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      ) : data ? (
        /* Rendered AI Analysis */
        <div className="pt-4 space-y-5">
          {/* Health Diagnosis Callout Banner */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-white p-4 rounded-2xl border border-indigo-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>Diagnosis Arus Kas 30 Hari</span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                "{data.healthDiagnosis}"
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Pola Belanja:</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
                  data.spendingAnomalyScore.toLowerCase().includes('optimal') ||
                  data.spendingAnomalyScore.toLowerCase().includes('sehat') ||
                  data.spendingAnomalyScore.toLowerCase().includes('terkendali')
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {data.spendingAnomalyScore}
              </span>
            </div>
          </div>

          {/* 3 Key Metrics Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kategori Pengeluaran Terbesar
              </span>
              <div className="font-extrabold text-sm text-slate-900 truncate">
                {data.keyMetricsSummary.dominantCategory}
              </div>
              <span className="text-[10px] text-slate-500">Konsentrasi arus kas keluar</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Rata-rata Burn Rate Harian
              </span>
              <div className="font-extrabold text-sm text-indigo-700 truncate">
                {data.keyMetricsSummary.dailyBurnRate}
              </div>
              <span className="text-[10px] text-slate-500">Laju konsumsi per 24 jam</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Potensi Efisiensi Bulanan
              </span>
              <div className="font-extrabold text-sm text-emerald-600 truncate">
                {data.keyMetricsSummary.savingsPotential}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Ruang alokasi tabungan ekstra</span>
            </div>
          </div>

          {/* Sub-Tabs: Insights vs Rekomendasi */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Temuan Insight ({data.insights.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rekomendasi Taktis ({data.actionableRecommendations.length})
              </button>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
              Data transaksi 30 hari terakhir
            </span>
          </div>

          {/* Tab 1: Insight Items */}
          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {data.insights.map((item, idx) => {
                const isPos = item.type === 'positive';
                const isWarn = item.type === 'warning';
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-2.5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isPos
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isWarn
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {isPos ? 'Poin Positif' : isWarn ? 'Perhatian' : 'Peluang'}
                        </span>
                        {isPos ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isWarn ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1 font-normal">
                        {item.detail}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-indigo-700 font-semibold bg-indigo-50/40 p-2 rounded-xl">
                      {item.impact}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Tab 2: Actionable Recommendations */}
          {activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2.5"
            >
              {data.actionableRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 mt-0.5 sm:mt-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-indigo-700 text-[11px] uppercase tracking-wider block">
                        {rec.step}
                      </span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                        {rec.action}
                      </p>
                    </div>
                  </div>
                  <div className="sm:self-center shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{rec.expectedBenefit}</span>
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* FIRE Impact Projection Footer Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-extrabold text-amber-900 block text-[11px] uppercase tracking-wider">
                Dampak ke Target Kebebasan Finansial (FIRE)
              </span>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed font-medium">
                {data.fireImpactNote}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
