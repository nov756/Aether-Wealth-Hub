import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { FinancialCalendarPlan } from '../types';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with required Calendar events scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory caching for Google OAuth access token (per workspace skill instructions)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initCalendarAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in via session, but token needs refresh or popup
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleCalendar = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Access Token Google Calendar dari kredensial.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCalendarAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogleCalendar = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Creates an event in the user's primary Google Calendar
 */
export const createGoogleCalendarEvent = async (
  accessToken: string,
  plan: FinancialCalendarPlan,
  currencySymbol: string = 'Rp'
): Promise<{ id: string; htmlLink: string }> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

  // Construct start & end ISO date-time strings
  const startTimeStr = plan.startTime || '09:00';
  const endTimeStr = plan.endTime || '10:00';

  const startDateTime = new Date(`${plan.targetDate}T${startTimeStr}:00`);
  const endDateTime = new Date(`${plan.targetDate}T${endTimeStr}:00`);

  // Ensure end is after start
  if (endDateTime <= startDateTime) {
    endDateTime.setHours(startDateTime.getHours() + 1);
  }

  // Recurrence rule
  const recurrenceRules: string[] = [];
  if (plan.recurrence === 'weekly') {
    recurrenceRules.push('RRULE:FREQ=WEEKLY');
  } else if (plan.recurrence === 'monthly') {
    recurrenceRules.push('RRULE:FREQ=MONTHLY');
  } else if (plan.recurrence === 'yearly') {
    recurrenceRules.push('RRULE:FREQ=YEARLY');
  }

  const formattedAmount = plan.targetAmount
    ? `\n💰 Target Nominal: ${currencySymbol} ${plan.targetAmount.toLocaleString('id-ID')}`
    : '';

  const eventPayload = {
    summary: `[Aether Wealth] ${plan.title}`,
    description: `📌 Kategori Finansial: ${plan.category}${formattedAmount}\n\n📝 Catatan Plan:\n${plan.description}\n\n✨ Dibuat otomatis melalui Aether Wealth Financial OS`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone,
    },
    ...(recurrenceRules.length > 0 ? { recurrence: recurrenceRules } : {}),
    reminders: {
      useDefault: false,
      overrides: [
        {
          method: 'popup',
          minutes: plan.reminderMinutes || 60,
        },
      ],
    },
    colorId: plan.category === 'Investment' ? '10' : plan.category === 'Bills' ? '11' : '9', // Google Calendar colors
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gagal membuat acara (${response.status})`;
    throw new Error(message);
  }

  const createdData = await response.json();
  return {
    id: createdData.id,
    htmlLink: createdData.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${createdData.id}`,
  };
};

/**
 * Deletes an event in user's Google Calendar.
 * (Note: Calling component MUST prompt user confirmation dialog before calling this).
 */
export const deleteGoogleCalendarEvent = async (
  accessToken: string,
  eventId: string
): Promise<void> => {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 204 No Content is normal for DELETE, 410 Gone / 404 Not Found also means removed
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gagal menghapus acara kalender (${response.status})`);
  }
};

/**
 * Fetches upcoming synced Aether Wealth events from user's primary calendar
 */
export const fetchUpcomingCalendarEvents = async (
  accessToken: string
): Promise<any[]> => {
  try {
    const nowIso = new Date().toISOString();
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('q', 'Aether');
    url.searchParams.set('timeMin', nowIso);
    url.searchParams.set('maxResults', '15');
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Could not fetch calendar events:', err);
    return [];
  }
};
