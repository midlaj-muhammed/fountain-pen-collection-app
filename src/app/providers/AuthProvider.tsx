import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  type AuthUser,
  createUser,
  getUser,
  onAuthChanged,
  signOut as fbSignOut,
  type UserInput,
} from '@/lib/firebase';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Build the default user document that gets seeded into
 * `users/{uid}` the first time a Firebase Auth user signs in. The
 * shape mirrors the `User` domain type minus the server-side
 * timestamps (which `createUser` fills in).
 */
function defaultUserInput(u: AuthUser): UserInput {
  return {
    displayName: u.displayName ?? '',
    email: u.email ?? '',
    photoURL: u.photoURL,
    emailVerified: u.emailVerified,
    plan: 'free',
    settings: {
      theme: 'system',
      fontSize: 'md',
      reminderEnabled: false,
      reminderHour: 20,
      reorderAlertEnabled: true,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Optimistic default; flips to 'signedOut' or 'signedIn' once onAuthChanged
  // fires for the first time. We track this explicitly so callers can render
  // a splash / loading state while the first event is in flight.
  const [firstEvent, setFirstEvent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (u) => {
      setUser(u);
      setFirstEvent(true);
      // Ensure the Firestore user doc exists. The codebase doesn't
      // (yet) have a Cloud Function auth.user().onCreate trigger,
      // so we seed from the client on first auth. The getUser
      // gate avoids the write on every cold start (and the
      // subsequent query-invalidation churn on every other screen).
      if (u) {
        try {
          const existing = await getUser(u.uid);
          if (!existing) {
            await createUser(u.uid, defaultUserInput(u));
          }
        } catch (err) {
          // Don't crash the auth flow if the user-doc seed fails;
          // screens that need the doc will surface their own
          // errors. Log so we can spot the issue in dev.
          // eslint-disable-next-line no-console
          console.warn('[auth] ensureUserDoc failed:', err);
        }
      }
    });
    return unsubscribe;
  }, []);

  const status: AuthStatus = !firstEvent ? 'loading' : user ? 'signedIn' : 'signedOut';

  const value: AuthContextValue = {
    user,
    status,
    signOut: async () => {
      await fbSignOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
