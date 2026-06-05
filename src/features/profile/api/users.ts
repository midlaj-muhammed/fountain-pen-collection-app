/**
 * User data layer. Users live at `users/{uid}` (a single document,
 * not a collection). On sign-up, the `AuthProvider` (or a Cloud
 * Function trigger) is expected to call `createUser` to seed the
 * profile + default settings.
 */
import { type DocumentReference, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { getDb } from '@/lib/firebase';
import type { User, UserSettings } from '@/types/domain';

export function userDoc(uid: string): DocumentReference<User> {
  return doc(getDb(), 'users', uid) as DocumentReference<User>;
}

export type UserInput = Omit<User, 'id' | 'uid' | 'createdAt' | 'updatedAt'>;

const defaultSettings: UserSettings = {
  theme: 'system',
  fontSize: 'md',
  reminderEnabled: false,
  reminderHour: 20,
  reorderAlertEnabled: true,
};

export async function createUser(uid: string, input: UserInput): Promise<void> {
  await setDoc(userDoc(uid), {
    ...input,
    settings: { ...defaultSettings, ...input.settings },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as User);
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(uid: string, patch: Partial<UserInput>): Promise<void> {
  await updateDoc(userDoc(uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  } as unknown as Partial<User>);
}
