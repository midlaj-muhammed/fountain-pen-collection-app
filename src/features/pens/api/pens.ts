/**
 * Pens data layer.
 *
 * Wraps Firestore reads/writes for `users/{uid}/pens/{penId}` with a small
 * typed surface. The TanStack Query hooks (in `./queries.ts`) compose this
 * with caching + invalidation.
 */
import {
  type CollectionReference,
  type DocumentReference,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { saveCache } from '@/lib/cache/mmkvCache';
import { userCollection } from '@/lib/firebase';
import type { Pen } from '@/types/domain';

/** `users/{uid}/pens` collection reference. */
export function pensCollection(uid: string): CollectionReference<Pen> {
  return userCollection<Pen>(uid, 'pens');
}

/** `users/{uid}/pens/{penId}` document reference. */
export function penDoc(uid: string, penId: string): DocumentReference<Pen> {
  return doc(pensCollection(uid), penId);
}

/** Default query: active pens (deletedAt == null), newest first. */
export function pensQuery(uid: string) {
  return query(pensCollection(uid), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'));
}

/** All pens including soft-deleted (for trash view in P3.x). */
export function pensQueryIncludingDeleted(uid: string) {
  return query(pensCollection(uid), orderBy('updatedAt', 'desc'));
}

// ── CRUD ──────────────────────────────────────────────────

export type PenInput = Omit<Pen, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export async function createPen(uid: string, input: PenInput): Promise<string> {
  const now = new Date();
  const ref = await addDoc(pensCollection(uid), {
    ...input,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as unknown as Pen);
  return ref.id;
}

export async function getPen(uid: string, penId: string): Promise<Pen | null> {
  const snap = await getDoc(penDoc(uid, penId));
  return snap.exists() ? (snap.data() as Pen) : null;
}

export async function updatePen(
  uid: string,
  penId: string,
  patch: Partial<PenInput>,
): Promise<void> {
  await updateDoc(penDoc(uid, penId), {
    ...patch,
    updatedAt: new Date(),
  } as unknown as Partial<Pen>);
}

/** Soft-delete: set deletedAt. The Cloud Function `purgeTrash` cleans up after 30d. */
export async function deletePen(uid: string, penId: string): Promise<void> {
  await updateDoc(penDoc(uid, penId), { deletedAt: new Date() } as unknown as Partial<Pen>);
}

/** Hard delete (admin / restore-to-fresh state). Use sparingly. */
export async function purgePen(uid: string, penId: string): Promise<void> {
  await deleteDoc(penDoc(uid, penId));
}

export async function listPens(uid: string): Promise<Pen[]> {
  const snap = await getDocs(pensQuery(uid));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pen, 'id'>) }));
  // Cold-start mirror — write a snapshot so the next launch can render
  // before Firestore is online. Best-effort; never throws.
  try {
    saveCache(`pens:${uid}`, list);
  } catch {
    // ignore
  }
  return list;
}

/** Upsert: write the entire doc at a known id. Used by tests and import flows. */
export async function upsertPen(uid: string, penId: string, pen: PenInput): Promise<void> {
  await setDoc(penDoc(uid, penId), {
    ...pen,
    deletedAt: null,
    updatedAt: new Date(),
  } as unknown as Pen);
}
