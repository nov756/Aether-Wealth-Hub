import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Users,
  CheckCircle2,
  Trash2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';
import {
  signInWithGoogle,
  registerEmailUser,
  createGuestUser,
  getInitials,
} from '../utils/firebaseAuth';
import {
  getStoredUsersList,
  removeUserFromRegistry,
  saveUserToRegistry,
} from '../utils/userStorage';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'switch';
  onClose: () => void;
  onSuccess: (user: User) => void;
  onDemoSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  onDemoSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [storedUsers, setStoredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setStoredUsers(getStoredUsersList());
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      setError(null);
      const appUser = await signInWithGoogle();
      onSuccess(appUser);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Jendela masuk Google ditutup sebelum selesai.');
      } else {
        setError('Gagal masuk dengan Google. Anda juga dapat mendaftar dengan email.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Harap isi email dan kata sandi.');
      return;
    }

    // Check if user exists in stored list, or create login session
    const existing = storedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    let loggedInUser: User;
    if (existing) {
      loggedInUser = existing;
    } else {
      const derivedName = email.includes('@') ? email.split('@')[0] : email;
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      loggedInUser = {
        id: `email_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: formattedName,
        email: email.trim().toLowerCase(),
        role: 'Member Finansial Mandiri',
        avatarInitials: getInitials(formattedName),
        joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        authProvider: 'email',
        themePreference: 'light-indigo',
        currencyCode: 'IDR',
      };
      saveUserToRegistry(loggedInUser);
    }

    onSuccess(loggedInUser);
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

    const newUser = registerEmailUser(name.trim(), email.trim());
    onSuccess(newUser);
    onClose();
  };

  const handleSelectExistingUser = (user: User) => {
    onSuccess(user);
    onClose();
  };

  const handleDeleteUserAccount = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    removeUserFromRegistry(userId);
    setStoredUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleGuestLogin = () => {
    const guestUser = createGuestUser();
    onSuccess(guestUser);
    onClose();
  };

  const handleDemoClick = () => {
    if (onDemoSuccess) {
      onDemoSuccess();
    } else {
      const demoUser: User = {
        id: 'demo_alex_rivera',
        name: 'Alex Rivera (Demo)',
        email: 'alex.demo@aether.io',
        role: 'Akun Demo Publik',
        avatarInitials: 'AR',
        joinedDate: 'September 2026',
        authProvider: 'demo',
        themePreference: 'light-indigo',
        currencyCode: 'IDR',
      };
      saveUserToRegistry(demoUser);
      onSuccess(demoUser);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md border border-slate-200 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
              {mode === 'switch'
                ? 'Ganti / Pilih Pengguna'
                : mode === 'login'
                ? 'Masuk ke Akun Anda'
                : 'Daftar Akun Baru'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Data setiap orang terpisah & dimulai dari Rp 0
            </p>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar vs Ganti Akun */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl border border-slate-200/70 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
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
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('switch');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'switch'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pengguna ({storedUsers.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Google Sign In Button */}
        {mode !== 'switch' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-98 disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loadingGoogle ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                Atau Menggunakan Email
              </span>
            </div>
          </div>
        )}

        {/* View Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Pengguna</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Buka Ruang Finansial Saya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* View Mode: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso / Nadin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 digit"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ulangi Sandi</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Akun Anda Dimulai Bersih dari Nol</span>
              </div>
              <p className="text-emerald-700 leading-tight">
                Saldo awal Rp 0, 0 transaksi, dan tidak tercampur dengan pengguna lain di domain ini.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Buat Akun Bersih & Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* View Mode: SWITCH ACCOUNT (List of users registered on this domain) */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Pilih profil pengguna yang pernah masuk pada domain ini:
            </p>

            {storedUsers.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  Belum ada akun lain yang tersimpan.
                </p>
                <button
                  onClick={() => setMode('register')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  + Buat Akun Baru Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {storedUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectExistingUser(u)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {u.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                        Pilih
                      </span>
                      <button
                        onClick={(e) => handleDeleteUserAccount(e, u.id)}
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus dari daftar perangkat ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setMode('register')}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-indigo-600 hover:bg-indigo-50/30 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Pengguna Baru di Domain Ini</span>
            </button>
          </div>
        )}

        {/* Guest & Demo Options */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="py-2 px-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            title="Masuk sebagai tamu dengan data bersih dari nol"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Tamu Baru (0)</span>
          </button>

          <button
            type="button"
            onClick={handleDemoClick}
            className="py-2 px-2.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            title="Muat data contoh simulasi Alex Rivera"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mode Demo</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
