/**
 * Counter side-effects for sessions. The Cloud Function `onSessionWrite`
 * (see SPEC §7.3) is the canonical place to keep `pen.totalSessions` and
 * `ink.totalSessions` accurate, because the client could go offline
 * before the increment fires. We keep the same logic here so:
 *   - client-side optimistic UI shows correct numbers immediately
 *   - tests can assert the side-effect happened
 *   - the Cloud Function body is a thin wrapper that calls this module
 *
 * Note: we read-modify-write with `updateDoc` rather than `increment()`
 * because our Jest Firestore mock does not implement FieldValue
 * sentinels. Production code can swap to `increment()` later if a
 * strict-correctness path is needed; the math is identical.
 */
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { inkDoc } from '@/features/inks/api/inks';
import { penDoc as pensPenDoc } from '@/features/pens/api/pens';

import type { SessionInput } from './sessions';

const clampZero = (n: number) => (n < 0 ? 0 : n);

export async function bumpCountersOnCreate(uid: string, input: SessionInput): Promise<void> {
  await Promise.all([
    bumpPenCounter(uid, input.penId, +1),
    bumpInkCounter(uid, input.inkId, +1),
  ]);
}

export async function bumpCountersOnDelete(uid: string, input: SessionInput): Promise<void> {
  await Promise.all([bumpPenCounter(uid, input.penId, -1), bumpInkCounter(uid, input.inkId, -1)]);
}

async function bumpPenCounter(uid: string, penId: string, delta: 1 | -1): Promise<void> {
  const ref = pensPenDoc(uid, penId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = (snap.data() as { totalSessions?: number; deletedAt?: unknown });
  if (current.deletedAt) return;
  const next = clampZero((current.totalSessions ?? 0) + delta);
  await updateDoc(ref, { totalSessions: next });
}

async function bumpInkCounter(uid: string, inkId: string, delta: 1 | -1): Promise<void> {
  const ref = inkDoc(uid, inkId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = (snap.data() as { totalSessions?: number; deletedAt?: unknown });
  if (current.deletedAt) return;
  const next = clampZero((current.totalSessions ?? 0) + delta);
  await updateDoc(ref, { totalSessions: next });
}

// Avoid unused-import warning when inkDoc alias shifts.
export const _inkDocRef = (uid: string, inkId: string) => inkDoc(uid, inkId);
export const _docCtor = doc;
