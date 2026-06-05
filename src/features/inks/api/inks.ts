/**
 * Inks data layer.
 *
 * Wraps Firestore reads/writes for `users/{uid}/inks/{inkId}` with a small
 * typed surface. Mirrors the pens data layer shape.
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

import { mirrorListToCache } from '@/lib/cache/mmkvCache';
import { userCollection } from '@/lib/firebase';
import type { Ink } from '@/types/domain';

/** `users/{uid}/inks` collection reference. */
export function inkCollection(uid: string): CollectionReference<Ink> {
  return userCollection<Ink>(uid, 'inks');
}

/** `users/{uid}/inks/{inkId}` document reference. */
export function inkDoc(uid: string, inkId: string): DocumentReference<Ink> {
  return doc(inkCollection(uid), inkId);
}

/** Default query: active inks (deletedAt == null), newest first. */
export function inksQuery(uid: string) {
  return query(inkCollection(uid), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'));
}

// ── CRUD ──────────────────────────────────────────────────

export type InkInput = Omit<Ink, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export async function createInk(uid: string, input: InkInput): Promise<string> {
  const now = new Date();
  const ref = await addDoc(inkCollection(uid), {
    ...input,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as unknown as Ink);
  return ref.id;
}

export async function getInk(uid: string, inkId: string): Promise<Ink | null> {
  const snap = await getDoc(inkDoc(uid, inkId));
  return snap.exists() ? (snap.data() as Ink) : null;
}

export async function updateInk(
  uid: string,
  inkId: string,
  patch: Partial<InkInput>,
): Promise<void> {
  await updateDoc(inkDoc(uid, inkId), {
    ...patch,
    updatedAt: new Date(),
  } as unknown as Partial<Ink>);
}

/** Soft-delete: set deletedAt. The Cloud Function `purgeTrash` cleans up after 30d. */
export async function deleteInk(uid: string, inkId: string): Promise<void> {
  await updateDoc(inkDoc(uid, inkId), { deletedAt: new Date() } as unknown as Partial<Ink>);
}

/** Hard delete (admin / restore-to-fresh state). Use sparingly. */
export async function purgeInk(uid: string, inkId: string): Promise<void> {
  await deleteDoc(inkDoc(uid, inkId));
}

export async function listInks(uid: string): Promise<Ink[]> {
  const snap = await getDocs(inksQuery(uid));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Ink, 'id'>) }));
  // Cold-start mirror — best-effort; never throws.
  mirrorListToCache(uid, 'inks', list);
  return list;
}

/** Upsert: write the entire doc at a known id. Used by tests and import flows. */
export async function upsertInk(uid: string, inkId: string, ink: InkInput): Promise<void> {
  await setDoc(inkDoc(uid, inkId), {
    ...ink,
    deletedAt: null,
    updatedAt: new Date(),
  } as unknown as Ink);
}
