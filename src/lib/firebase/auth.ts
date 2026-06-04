import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import { z } from 'zod';

import { getFirebaseApp } from './client';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

const credentialsSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function toAuthUser(u: FirebaseUser | null): AuthUser | null {
  if (!u) return null;
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const parsed = credentialsSchema.parse({ email, password });
  const cred = await signInWithEmailAndPassword(
    getAuth(getFirebaseApp()),
    parsed.email,
    parsed.password,
  );
  return toAuthUser(cred.user)!;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  const parsed = credentialsSchema.parse({ email, password });
  const cred = await createUserWithEmailAndPassword(
    getAuth(getFirebaseApp()),
    parsed.email,
    parsed.password,
  );
  return toAuthUser(cred.user)!;
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(getAuth(getFirebaseApp()), provider);
  return toAuthUser(cred.user)!;
}

export async function signOut(): Promise<void> {
  await fbSignOut(getAuth(getFirebaseApp()));
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * The callback receives `null` when the user signs out.
 */
export function onAuthChanged(cb: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getAuth(getFirebaseApp()), (u) => cb(toAuthUser(u)));
}
