/**
 * Sessions data layer — S3.2 introduces this so the QuickLog can create a
 * session in one tap. S4 extends it (Cloud Function trigger, full CRUD,
 * date-grouped query).
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
  updateDoc,
  where,
} from 'firebase/firestore';

import { saveCache } from '@/lib/cache/mmkvCache';
import { userCollection } from '@/lib/firebase';
import type { Session } from '@/types/domain';

export function sessionCollection(uid: string): CollectionReference<Session> {
  return userCollection<Session>(uid, 'sessions');
}

export function sessionDoc(uid: string, id: string): DocumentReference<Session> {
  return doc(sessionCollection(uid), id);
}

export function sessionsQuery(uid: string) {
  return query(
    sessionCollection(uid),
    where('deletedAt', '==', null),
    orderBy('date', 'desc'),
  );
}

export type SessionInput = Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export async function createSession(uid: string, input: SessionInput): Promise<string> {
  const now = new Date();
  const ref = await addDoc(sessionCollection(uid), {
    ...input,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as unknown as Session);
  return ref.id;
}

export async function getSession(uid: string, id: string): Promise<Session | null> {
  const snap = await getDoc(sessionDoc(uid, id));
  return snap.exists() ? (snap.data() as Session) : null;
}

export async function updateSession(
  uid: string,
  id: string,
  patch: Partial<SessionInput>,
): Promise<void> {
  await updateDoc(sessionDoc(uid, id), {
    ...patch,
    updatedAt: new Date(),
  } as unknown as Partial<Session>);
}

export async function deleteSession(uid: string, id: string): Promise<void> {
  await updateDoc(sessionDoc(uid, id), { deletedAt: new Date() } as unknown as Partial<Session>);
}

export async function purgeSession(uid: string, id: string): Promise<void> {
  await deleteDoc(sessionDoc(uid, id));
}

export async function listSessions(uid: string): Promise<Session[]> {
  const snap = await getDocs(sessionsQuery(uid));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Session, 'id'>) }));
  try {
    saveCache(`sessions:${uid}`, list);
  } catch {
    // ignore
  }
  return list;
}
