import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Shield,
  Download,
  RotateCcw,
  LogOut,
  Sparkles,
  CheckCircle2,
  Globe,
  Wallet,
  Settings as SettingsIcon,
  Sliders,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { CurrencyCode, CurrencyConfig, ThemeId, User } from '../types';
import { CURRENCIES } from '../data/initialData';
import { THEMES } from '../data/themes';

interface SettingsTabProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  currency: CurrencyConfig;
  setCurrency: (c: CurrencyConfig) => void;
  onResetData: () => void;
  onLogout: () => void;
  onExportData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentUser,
  onUpdateUser,
  currentTheme,
  onSelectTheme,
  currency,
  setCurrency,
  onResetData,
  onLogout,
  onExportData,
}) => {
  const [name, setName] = useState(currentUser?.name || 'Alex Rivera');
  const [email, setEmail] = useState(currentUser?.email || 'alex@aether.io');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'US';

    onUpdateUser({
      name: name.trim(),
      email: email.trim(),
      role: currentUser?.role || 'Pro Member',
      avatarInitials: initials,
      joinedDate: currentUser?.joinedDate || 'September 2026',
      themePreference: currentTheme,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleThemeChange = (id: ThemeId) => {
    onSelectTheme(id);
    if (currentUser) {
      onUpdateUser({
        ...currentUser,
        themePreference: id,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            <span>Pengaturan Akun & Model Tema</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola profil pengguna, sesuaikan model tema tampilan favorit, dan atur preferensi finansial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              {currentUser?.avatarInitials || 'US'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {currentUser?.name || 'User Aether'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {currentUser?.role || 'Pro Member'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Bergabung {currentUser?.joinedDate || '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active Theme in User Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tema Akun Aktif</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold">
                {THEMES.find((t) => t.id === currentTheme)?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {THEMES.find((t) => t.id === currentTheme)?.name}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nama Tampilan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Terdaftar</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Perubahan Profil</span>
              )}
            </button>
          </form>

          {/* Session Logout Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100/80 font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 border border-rose-200/80 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Theme Model Customizer & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* THEME MODEL CUSTOMIZER CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Palette className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Pilih Model Tema Tampilan</h3>
                  <p className="text-[11px] text-slate-500">
                    Sesuaikan suasana visual sesuai preferensi Anda, tersimpan otomatis di akun
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                5 Model Tema
              </span>
            </div>

            {/* Grid of 5 Theme Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {THEMES.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20 bg-indigo-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-slate-50/40'
                    }`}
                  >
                    {/* Top row: Theme name & category badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span className="font-extrabold text-xs text-slate-900">
                          {theme.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            theme.category === 'light'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {theme.category === 'light' ? 'Cerah' : 'Gelap'}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3 font-normal">
                      {theme.description}
                    </p>

                    {/* Preview palette bar */}
                    <div className="h-4 rounded-lg overflow-hidden flex border border-slate-200/80">
                      <div
                        className="flex-1"
                        style={{
                          backgroundColor:
                            theme.category === 'light'
                              ? theme.id === 'light-emerald'
                                ? '#f0fdf4'
                                : theme.id === 'light-amber'
                                ? '#fffbeb'
                                : '#f8fafc'
                              : theme.id === 'dark-obsidian'
                              ? '#090d16'
                              : '#0b132b',
                        }}
                      />
                      <div
                        className="w-1/3"
                        style={{
                          backgroundColor:
                            theme.category === 'light' ? '#ffffff' : '#1e293b',
                        }}
                      />
                      <div
                        className="w-1/4"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <div
                        className="w-1/6"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Preferensi Finansial & Mata Uang</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <label className="block text-slate-700 font-bold">Mata Uang Utama</label>
                <p className="text-[11px] text-slate-500">
                  Konversi otomatis nilai transaksi dan akun ke simbol lokal
                </p>
                <select
                  value={currency.code}
                  onChange={(e) => setCurrency(CURRENCIES[e.target.value as CurrencyCode])}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <label className="block text-slate-700 font-bold">Aturan Penarikan FIRE</label>
                <p className="text-[11px] text-slate-500">
                  Standar Trinity Study yang digunakan pada simulator kebebasan finansial
                </p>
                <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center justify-between">
                  <span>Trinity 4.0% Safe Withdrawal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Data Management Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <Shield className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Data & Cadangan</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh data akun, histori transaksi, alokasi 50/30/20, pilihan tema, dan simulator disimpan secara aman di browser lokal Anda (LocalStorage) tanpa pelacakan pihak ketiga.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={onExportData}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <button
                type="button"
                onClick={onResetData}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold border border-rose-200/80 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset ke Data Awal Pabrik</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
