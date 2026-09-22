import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './googleCalendar';
import { User } from '../types';
import { saveUserToRegistry } from './userStorage';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const getInitials = (name: string): string => {
  if (!name) return 'US';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser: FirebaseUser = result.user;

  const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna Google';
  const initials = getInitials(displayName);

  const appUser: User = {
    id: fbUser.uid,
    name: displayName,
    email: fbUser.email || 'google_user@domain.com',
    role: 'Verified Google Account',
    avatarInitials: initials,
    photoURL: fbUser.photoURL || undefined,
    joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    authProvider: 'google',
    themePreference: 'light-indigo',
    currencyCode: 'IDR',
  };

  saveUserToRegistry(appUser);
  return appUser;
};

export const registerEmailUser = (name: string, email: string): User => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const userId = `email_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const initials = getInitials(cleanName);

  const appUser: User = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    role: 'Member Finansial Mandiri',
    avatarInitials: initials,
    joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    authProvider: 'email',
    themePreference: 'light-indigo',
    currencyCode: 'IDR',
  };

  saveUserToRegistry(appUser);
  return appUser;
};

export const createGuestUser = (): User => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const userId = `guest_${Date.now()}`;
  const appUser: User = {
    id: userId,
    name: `Tamu Finansial #${randomSuffix}`,
    email: `guest${randomSuffix}@aether.local`,
    role: 'Mode Tamu (Privat)',
    avatarInitials: `T${randomSuffix.toString().slice(-1)}`,
    joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    authProvider: 'guest',
    themePreference: 'light-indigo',
    currencyCode: 'IDR',
  };

  saveUserToRegistry(appUser);
  return appUser;
};

export const logoutAuth = async (): Promise<void> => {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.error('Error signing out from Firebase:', e);
  }
};
