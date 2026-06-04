import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { type AuthUser, onAuthChanged, signOut as fbSignOut } from '@/lib/firebase';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Optimistic default; flips to 'signedOut' or 'signedIn' once onAuthChanged
  // fires for the first time. We track this explicitly so callers can render
  // a splash / loading state while the first event is in flight.
  const [firstEvent, setFirstEvent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChanged((u) => {
      setUser(u);
      setFirstEvent(true);
    });
    return unsubscribe;
  }, []);

  const status: AuthStatus = !firstEvent ? 'loading' : user ? 'signedIn' : 'signedOut';

  const value: AuthContextValue = {
    user,
    status,
    signOut: fbSignOut,
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
