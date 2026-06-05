/**
 * Nib-swap data layer.
 *
 * Nib swaps are sub-collections of a pen: `users/{uid}/pens/{penId}/nibSwaps`.
 * Each swap records the date, the outgoing nib, the incoming nib, and
 * optional notes. We intentionally do NOT soft-delete swaps; the
 * history of a pen should be immutable.
 */
import {
  type CollectionReference,
  type DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { getDb } from '@/lib/firebase';
import type { NibSwap } from '@/types/domain';

export function nibSwapCollection(uid: string, penId: string): CollectionReference<NibSwap> {
  return collection(getDb(), 'users', uid, 'pens', penId, 'nibSwaps') as CollectionReference<NibSwap>;
}

export function nibSwapDoc(uid: string, penId: string, swapId: string): DocumentReference<NibSwap> {
  return doc(nibSwapCollection(uid, penId), swapId);
}

export function nibSwapsQuery(uid: string, penId: string) {
  return query(nibSwapCollection(uid, penId), orderBy('date', 'desc'));
}

// ── CRUD ──────────────────────────────────────────────────

export type NibSwapInput = Omit<NibSwap, 'id' | 'createdAt'>;

export async function createNibSwap(
  uid: string,
  penId: string,
  input: NibSwapInput,
): Promise<string> {
  const ref = await addDoc(nibSwapCollection(uid, penId), {
    ...input,
    createdAt: new Date(),
  } as unknown as NibSwap);
  return ref.id;
}

export async function getNibSwap(
  uid: string,
  penId: string,
  swapId: string,
): Promise<NibSwap | null> {
  const snap = await getDoc(nibSwapDoc(uid, penId, swapId));
  return snap.exists() ? (snap.data() as NibSwap) : null;
}

export async function updateNibSwap(
  uid: string,
  penId: string,
  swapId: string,
  patch: Partial<NibSwapInput>,
): Promise<void> {
  await updateDoc(nibSwapDoc(uid, penId, swapId), patch as unknown as Partial<NibSwap>);
}

export async function deleteNibSwap(
  uid: string,
  penId: string,
  swapId: string,
): Promise<void> {
  await deleteDoc(nibSwapDoc(uid, penId, swapId));
}

export async function listNibSwaps(uid: string, penId: string): Promise<NibSwap[]> {
  const snap = await getDocs(nibSwapsQuery(uid, penId));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NibSwap, 'id'>) }));
}
