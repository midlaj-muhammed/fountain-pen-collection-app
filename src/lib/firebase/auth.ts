import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { z } from 'zod';

import { getFirebaseAuth } from './client';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
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
    emailVerified: u.emailVerified,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const parsed = credentialsSchema.parse({ email, password });
  const cred = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    parsed.email,
    parsed.password,
  );
  return toAuthUser(cred.user)!;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  const parsed = credentialsSchema.parse({ email, password });
  const cred = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    parsed.email,
    parsed.password,
  );
  return toAuthUser(cred.user)!;
}

/**
 * Google Sign-in on iOS / Android uses
 * `@react-native-google-signin/google-signin` for the native UI. The
 * library hands us an `idToken`; we exchange it for a Firebase
 * credential via `signInWithCredential`. This replaces the old
 * `signInWithPopup` flow which only works on web.
 *
 * Pre-conditions (handled by the native module, not by us):
 *   - The GoogleSignin library is configured with the iOS / Android
 *     client id at app start. See docs/google-signin-p4.md.
 *   - Google Play Services is up to date on Android.
 *   - The bundle id matches the OAuth client id registered in the
 *     Firebase console (currently com.penapp.penApp).
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('Google Sign-in returned no idToken.');
  }
  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const cred = await signInWithCredential(getFirebaseAuth(), credential);
  return toAuthUser(cred.user)!;
}

export async function signOut(): Promise<void> {
  await fbSignOut(getFirebaseAuth());
  // Also clear the native Google session so the next signIn flow
  // shows the account chooser instead of silently re-using the
  // last account.
  try {
    await GoogleSignin.signOut();
  } catch {
    // GoogleSignin.signOut is best-effort; an emulator or a non-
    // Google sign-in user may not have a session to clear.
  }
}

/**
 * Send a password-reset email via Firebase Auth. Throws on invalid
 * email or network failure; the caller is expected to surface the
 * error to the user. Used by the Forgot Password screen.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const parsed = z.string().email('Invalid email').parse(email);
  await fbSendPasswordResetEmail(getFirebaseAuth(), parsed);
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * The callback receives `null` when the user signs out.
 */
export function onAuthChanged(cb: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (u) => cb(toAuthUser(u)));
}
