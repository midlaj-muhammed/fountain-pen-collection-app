import { createContext, useContext, type ReactNode } from 'react';

/**
 * Placeholder AuthProvider for P0. The real implementation lives in P2 and
 * wires Firebase Auth + a Zustand store. For P0 we just expose a no-op
 * `useAuth` so consumers can be written against the eventual interface.
 */

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: 'loading' | 'signedIn' | 'signedOut';
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // P0 stub: always signed out. P2 will replace this with onAuthStateChanged.
  const value: AuthContextValue = {
    user: null,
    status: 'signedOut',
    signOut: async () => {},
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
