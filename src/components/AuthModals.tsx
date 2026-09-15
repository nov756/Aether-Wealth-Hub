import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Sparkles, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@aether.io');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync mode if initialMode changes while opened
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Harap isi email dan password.');
      return;
    }

    const userName = email.includes('@') ? email.split('@')[0] : email;
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    const initials = formattedName.substring(0, 2).toUpperCase();

    onSuccess({
      name: formattedName,
      email: email.trim(),
      role: 'Pro Member',
      avatarInitials: initials,
      joinedDate: 'September 2026',
    });
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    const initials = name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'US';

    onSuccess({
      name: name.trim(),
      email: email.trim(),
      role: 'Pro Member',
      avatarInitials: initials,
      joinedDate: 'September 2026',
    });
    onClose();
  };

  const handleQuickDemo = () => {
    onSuccess({
      name: 'Alex Rivera',
      email: 'alex@aether.io',
      role: 'Pro Member',
      avatarInitials: 'AR',
      joinedDate: 'September 2026',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md border border-slate-200 shadow-2xl space-y-5 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
              {mode === 'login' ? 'Masuk ke Aether OS' : 'Daftar Akun Baru'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'login'
                ? 'Kelola alokasi kekayaan dan kebebasan finansialmu'
                : 'Mulai perjalanan perencanaan finansial modernmu'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/70 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        {/* Form Container */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="alex@aether.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-bold">Password</label>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-semibold">
                  Lupa?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Masuk Cepat Mode Demo (Alex Rivera)</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sarah Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="sarah@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ulangi Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Data finansial Anda disimpan aman secara lokal dengan enkripsi client-side.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Buat Akun & Akses App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
