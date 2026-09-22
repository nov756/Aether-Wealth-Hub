import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Repeat,
  DollarSign,
  TrendingUp,
  CreditCard,
  Flame,
  Check,
  CalendarCheck,
  LogOut,
} from 'lucide-react';
import { CurrencyConfig, FinancialCalendarPlan, PlanCategory } from '../types';
import { PlanModal } from './PlanModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  fetchUpcomingCalendarEvents,
  getCalendarAccessToken,
  initCalendarAuth,
  signInWithGoogleCalendar,
  signOutGoogleCalendar,
} from '../utils/googleCalendar';
import { User as FirebaseUser } from 'firebase/auth';

interface CalendarTabProps {
  plans: FinancialCalendarPlan[];
  setPlans: React.Dispatch<React.SetStateAction<FinancialCalendarPlan[]>>;
  currency: CurrencyConfig;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  plans,
  setPlans,
  currency,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null); // plan ID currently syncing
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Filter & Modals
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FinancialCalendarPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<FinancialCalendarPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Google Calendar Live Upcoming Events
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch calendar events when access token is available
  useEffect(() => {
    if (accessToken) {
      loadCalendarEvents(accessToken);
    }
  }, [accessToken]);

  const loadCalendarEvents = async (token: string) => {
    setIsLoadingEvents(true);
    try {
      const items = await fetchUpcomingCalendarEvents(token);
      setGoogleEvents(items);
    } catch (err) {
      console.error('Failed to load Google events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const showNotification = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Google Sign-In with Calendar Scope
  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogleCalendar();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        showNotification(
          'success',
          `Berhasil terhubung dengan Google Calendar (${result.user.email})!`
        );
        loadCalendarEvents(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showNotification(
        'error',
        err.message || 'Koneksi ke Google Calendar dibatalkan atau gagal.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await signOutGoogleCalendar();
      setGoogleUser(null);
      setAccessToken(null);
      setGoogleEvents([]);
      showNotification('info', 'Koneksi Google Calendar telah diputus.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Sync a single plan to Google Calendar
  const handleSyncToCalendar = async (plan: FinancialCalendarPlan) => {
    let currentToken = accessToken;
    if (!currentToken) {
      // Prompt user to connect first
      setIsAuthenticating(true);
      try {
        const result = await signInWithGoogleCalendar();
        if (result) {
          setGoogleUser(result.user);
          setAccessToken(result.accessToken);
          currentToken = result.accessToken;
        } else {
          return;
        }
      } catch (err: any) {
        showNotification('error', 'Silakan hubungkan akun Google Anda terlebih dahulu.');
        setIsAuthenticating(false);
        return;
      } finally {
        setIsAuthenticating(false);
      }
    }

    if (!currentToken) return;

    setIsSyncing(plan.id);
    try {
      const created = await createGoogleCalendarEvent(currentToken, plan, currency.symbol);
      const updatedPlans = plans.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              googleEventId: created.id,
              googleEventLink: created.htmlLink,
              syncedAt: new Date().toISOString(),
              status: 'synced' as const,
            }
          : p
      );
      setPlans(updatedPlans);
      showNotification('success', `Rencana "${plan.title}" berhasil dijadwalkan di Google Calendar!`);
      loadCalendarEvents(currentToken);
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      showNotification(
        'error',
        `Gagal menyinkronkan ke Google Calendar: ${err.message || 'Error tidak diketahui'}`
      );
    } finally {
      setIsSyncing(null);
    }
  };

  // Save new or edited plan
  const handleSavePlan = async (
    plan: FinancialCalendarPlan,
    syncDirectly: boolean
  ) => {
    const existingIndex = plans.findIndex((p) => p.id === plan.id);
    let nextPlans: FinancialCalendarPlan[];
    if (existingIndex >= 0) {
      nextPlans = [...plans];
      nextPlans[existingIndex] = plan;
    } else {
      nextPlans = [plan, ...plans];
    }
    setPlans(nextPlans);

    if (syncDirectly) {
      await handleSyncToCalendar(plan);
    } else {
      showNotification('success', `Rencana "${plan.title}" berhasil disimpan.`);
    }
  };

  // Confirm delete (Destructive action confirmation required by skill)
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);

    try {
      // If plan has a synced Google Calendar event, delete it from calendar
      if (planToDelete.googleEventId && accessToken) {
        try {
          await deleteGoogleCalendarEvent(accessToken, planToDelete.googleEventId);
        } catch (calendarErr) {
          console.warn('Could not delete calendar event, continuing removal:', calendarErr);
        }
      }

      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      showNotification('success', `Rencana "${planToDelete.title}" telah dihapus.`);
      if (accessToken) loadCalendarEvents(accessToken);
    } catch (err: any) {
      showNotification('error', `Gagal menghapus rencana: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setPlanToDelete(null);
    }
  };

  // Quick Presets
  const handleApplyPreset = (preset: Partial<FinancialCalendarPlan>) => {
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const newPlan: FinancialCalendarPlan = {
      id: `plan-${Date.now()}`,
      title: preset.title || 'Evaluasi Finansial',
      category: preset.category || 'Review',
      description: preset.description || '',
      targetAmount: preset.targetAmount,
      targetDate: preset.targetDate || `${yyyy}-${mm}-${dd}`,
      startTime: preset.startTime || '09:00',
      endTime: preset.endTime || '10:00',
      recurrence: preset.recurrence || 'monthly',
      reminderMinutes: preset.reminderMinutes || 60,
      status: 'planned',
    };

    setEditingPlan(newPlan);
    setIsPlanModalOpen(true);
  };

  // Filtered plans
  const filteredPlans = plans.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const syncedCount = plans.filter((p) => !!p.googleEventId).length;
  const totalScheduledAmount = plans.reduce((acc, p) => acc + (p.targetAmount || 0), 0);

  const getCategoryBadge = (cat: PlanCategory) => {
    switch (cat) {
      case 'Review':
        return { label: 'Evaluasi 50/30/20', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'Savings':
        return { label: 'Tabungan', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'Investment':
        return { label: 'Investasi (DCA)', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
      case 'Bills':
        return { label: 'Tagihan Rutin', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'Debt':
        return { label: 'Pelunasan Utang', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'FIRE':
        return { label: 'Milestone FIRE', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      default:
        return { label: cat, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded-md"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. GOOGLE CALENDAR CONNECTION HERO BANNER */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-sky-400/5 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-3">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Integrasi Resmi Google Workspace Calendar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Ajuin Rencana Finansial & Sambungkan ke Google Kalender
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
              Disiplin keuangan dimulai dari jadwal yang jelas. Ajukan agenda alokasi gaji, setoran investasi berkala, atau deadline tagihan, dan sinkronkan langsung ke akun Google Calendar Anda dengan izin pengguna.
            </p>
          </div>

          {/* Connection Control Card */}
          <div className="w-full lg:w-auto shrink-0">
            {googleUser ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {googleUser.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate max-w-[180px]">
                        {googleUser.displayName || 'Pengguna Google'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold block truncate max-w-[200px]">
                      {googleUser.email}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      ✓ Google Calendar Aktif
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => accessToken && loadCalendarEvents(accessToken)}
                    disabled={isLoadingEvents}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Segarkan Jadwal Google Calendar"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin text-indigo-600' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={handleDisconnectGoogle}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Putuskan sambungan Google Calendar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Putuskan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Official Material Google Sign In Button */}
                <button
                  onClick={handleConnectGoogle}
                  disabled={isAuthenticating}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
                  aria-label="Sambungkan Google Calendar"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isAuthenticating ? 'Menghubungkan...' : 'Sambungkan Google Calendar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permission guarantee notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Aplikasi hanya membuat dan memperbarui jadwal finansial Anda dengan persetujuan penuh. Token disimpan aman di memori sesi.
          </span>
        </div>
      </div>

      {/* 2. STATS & SUMMARY PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-black uppercase text-slate-400">Total Rencana Aktif</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
            <span>{plans.length}</span>
            <span className="text-xs font-semibold text-slate-500">Agenda</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            Mencakup evaluasi, tabungan, tagihan & FIRE
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-black uppercase text-slate-400">Tersinkron di Google Calendar</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{syncedCount}</span>
            <span className="text-xs font-semibold text-slate-500">dari {plans.length} acara</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {syncedCount === plans.length ? '✓ Seluruh rencana tersinkron' : `${plans.length - syncedCount} belum dikirim ke kalender`}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-black uppercase text-slate-400">Nominal Terjadwal</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {currency.symbol} {(totalScheduledAmount * currency.rateFromUSD).toLocaleString(currency.locale, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            Total target alokasi dalam siklus rencana
          </div>
        </div>
      </div>

      {/* 3. TEMPLATE PRESETS 1-CLICK (REKOMENDASI CERDAS) */}
      <div className="bg-slate-50/90 rounded-3xl p-5 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
              Rekomendasi Agenda Finansial Cepat (1-Klik Ajuin)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Klik untuk langsung membuat jadwal otomatis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset 1 */}
          <button
            onClick={() =>
              handleApplyPreset({
                title: 'Review Gajian & Alokasi 50/30/20',
                category: 'Review',
                targetAmount: 3000,
                description: 'Cek slip gaji, transfer 50% untuk kebutuhan pokok, 30% batas keinginan, dan 20% langsung tabung.',
                recurrence: 'monthly',
                reminderMinutes: 60,
              })
            }
            className="p-3.5 rounded-2xl bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-left transition-all active:scale-97 cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-900">
              Gajian & Review 50/30/20
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Tiap bulan • Reminder 1 Jam
            </div>
          </button>

          {/* Preset 2 */}
          <button
            onClick={() =>
              handleApplyPreset({
                title: 'Top Up Dana Darurat (HYSA)',
                category: 'Savings',
                targetAmount: 500,
                description: 'Setor dana ke rekening tabungan imbal hasil tinggi (HYSA) hingga tercapai 6 bulan biaya hidup.',
                recurrence: 'monthly',
                reminderMinutes: 120,
              })
            }
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-left transition-all active:scale-97 cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-900">
              Setoran Dana Darurat
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Tiap bulan • Rekomendasi 20%
            </div>
          </button>

          {/* Preset 3 */}
          <button
            onClick={() =>
              handleApplyPreset({
                title: 'DCA Index ETF & Saham Dividen',
                category: 'Investment',
                targetAmount: 800,
                description: 'Beli reksadana indeks atau saham teratur (Dollar Cost Averaging) demi kebebasan finansial.',
                recurrence: 'monthly',
                reminderMinutes: 60,
              })
            }
            className="p-3.5 rounded-2xl bg-white hover:bg-sky-50/80 border border-slate-200 hover:border-sky-300 text-left transition-all active:scale-97 cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 group-hover:text-sky-900">
              DCA Portofolio Investasi
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Tiap bulan • Compounding
            </div>
          </button>

          {/* Preset 4 */}
          <button
            onClick={() =>
              handleApplyPreset({
                title: 'Audit Langganan & Tagihan Rutin',
                category: 'Bills',
                targetAmount: 200,
                description: 'Periksa langganan aplikasi tidak terpakai, bayar tagihan listrik & wifi sebelum tenggat waktu.',
                recurrence: 'monthly',
                reminderMinutes: 1440,
              })
            }
            className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-left transition-all active:scale-97 cursor-pointer group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 group-hover:text-amber-900">
              Audit Tagihan Rutin
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              H-1 Reminder • Hindari Denda
            </div>
          </button>
        </div>
      </div>

      {/* 4. MAIN ACTION TOOLBAR & FILTER TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Rencana' },
            { id: 'Review', label: 'Evaluasi' },
            { id: 'Savings', label: 'Tabungan' },
            { id: 'Investment', label: 'Investasi' },
            { id: 'Bills', label: 'Tagihan' },
            { id: 'FIRE', label: 'FIRE' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Button: + Ajuin Plan Baru */}
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsPlanModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-97 transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Ajuin Plan Baru</span>
        </button>
      </div>

      {/* 5. LIST OF FINANCIAL PLANS */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Belum Ada Rencana Finansial</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
              Mulai buat rencana evaluasi anggaran, setoran dana darurat, atau cicilan investasi Anda sekarang.
            </p>
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsPlanModalOpen(true);
              }}
              className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Rencana Pertama</span>
            </button>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const badge = getCategoryBadge(plan.category);
            const isSynced = !!plan.googleEventId;
            const syncingThis = isSyncing === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>

                    {/* Recurrence Pill */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-slate-500" />
                      <span>
                        {plan.recurrence === 'monthly'
                          ? 'Tiap Bulan'
                          : plan.recurrence === 'weekly'
                          ? 'Tiap Minggu'
                          : plan.recurrence === 'yearly'
                          ? 'Tiap Tahun'
                          : 'Sekali Saja'}
                      </span>
                    </span>

                    {/* Google Sync Status Pill */}
                    {isSynced ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Tersambung di Google Calendar</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Belum Dikirim ke Kalender
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {plan.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5 text-indigo-700">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{plan.targetDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{plan.startTime} - {plan.endTime}</span>
                    </div>

                    {plan.targetAmount && plan.targetAmount > 0 && (
                      <div className="flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md">
                        <span>Target:</span>
                        <span>
                          {currency.symbol}{' '}
                          {(plan.targetAmount * currency.rateFromUSD).toLocaleString(currency.locale, {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Send to Google Calendar / Resync */}
                    {isSynced ? (
                      plan.googleEventLink && (
                        <a
                          href={plan.googleEventLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Buka Acara di Google Calendar Web"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Buka di Kalender</span>
                        </a>
                      )
                    ) : (
                      <button
                        onClick={() => handleSyncToCalendar(plan)}
                        disabled={syncingThis}
                        className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>{syncingThis ? 'Mengirim...' : 'Kirim ke Kalender'}</span>
                      </button>
                    )}

                    {/* Edit Plan */}
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsPlanModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Detail Rencana"
                      aria-label="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Plan (Requires explicit confirmation) */}
                    <button
                      onClick={() => setPlanToDelete(plan)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Rencana"
                      aria-label="Hapus Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {plan.syncedAt && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Tersinkron: {new Date(plan.syncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. GOOGLE CALENDAR LIVE FEED WIDGET */}
      {googleUser && googleEvents.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Jadwal Google Calendar Mendatang
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Acara aktif yang terhubung langsung dari akun Google Calendar Anda
                </p>
              </div>
            </div>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Buka Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {googleEvents.map((ev: any) => {
              const startRaw = ev.start?.dateTime || ev.start?.date;
              const startDate = startRaw ? new Date(startRaw) : new Date();

              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {startDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {ev.summary || 'Acara Finansial'}
                  </h4>
                  {ev.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {ev.description}
                    </p>
                  )}
                  {ev.htmlLink && (
                    <a
                      href={ev.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 hover:underline font-bold inline-flex items-center gap-1 mt-1"
                    >
                      <span>Lihat di Kalender</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSave={handleSavePlan}
        editingPlan={editingPlan}
        currency={currency}
        isCalendarConnected={!!googleUser}
      />

      {/* Explicit User Confirmation Modal for Destructive Delete */}
      <ConfirmDeleteModal
        isOpen={!!planToDelete}
        title="Hapus Rencana Finansial?"
        message="Tindakan ini akan menghapus rencana dari daftar Aether Wealth Anda. Apakah Anda yakin ingin melanjutkan?"
        itemTitle={planToDelete?.title}
        isCalendarSynced={!!planToDelete?.googleEventId}
        onConfirm={handleConfirmDelete}
        onClose={() => setPlanToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};
