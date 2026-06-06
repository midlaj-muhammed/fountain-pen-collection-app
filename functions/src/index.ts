/**
 * MyPen Cloud Functions.
 *
 * Five functions:
 *   - onUserCreated    — Auth trigger; seeds the Firestore
 *     users/{uid} doc with default settings the first time a
 *     Firebase Auth user is created (email signup, Google
 *     sign-in, Apple sign-in, anonymous upgrade, etc.).
 *   - onSessionCreated / onSessionDeleted — Firestore triggers;
 *     keep pen/ink counters in sync with session create/delete.
 *   - monthlyStats     — scheduled; pre-aggregates sessions into
 *     users/{uid}/stats/{YYYY-MM} for fast client reads.
 *   - deleteUserData   — HTTPS callable; cascade-deletes a user's
 *     data + Storage + Auth user. Called from the client when the
 *     user types "DELETE" in the account-deletion modal.
 *
 * Pure logic (counters, buckets, deletion plan) lives in logic.ts
 * so it can be unit-tested without the admin SDK.
 */
import * as admin from 'firebase-admin';
import { user as authUser } from 'firebase-functions/v1/auth';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

import {
  applySessionDelta,
  bucketForMonth,
  computeMonthlyBuckets,
  defaultUserDocPayload,
  planUserDataDeletion,
  type SessionChangeType,
  type SessionLike,
} from './logic';

admin.initializeApp();

// ── onUserCreated ────────────────────────────────────────────

/**
 * Seeds the Firestore `users/{uid}` doc the first time a Firebase
 * Auth user is created. Without this, every screen that calls
 * `useUser(uid)` returns `null` for the lifetime of the user (until
 * the client-side fallback in AuthProvider runs) and shows a
 * skeleton forever.
 *
 * Idempotent: the trigger uses `set(..., { merge: true })` so a
 * pre-existing doc (e.g. written by the client-side seed or a
 * partial earlier write) is left intact. We only fill in missing
 * fields, never overwrite the user's choices.
 */
export const onUserCreated = authUser().onCreate(async (user) => {
  const { uid } = user;
  const userRef = admin.firestore().doc(`users/${uid}`);
  const snap = await userRef.get();
  if (snap.exists) {
    // Doc already exists (e.g. client-side seed, or a manual
    // write during testing). Don't touch it.
    return;
  }
  await userRef.set(
    {
      ...defaultUserDocPayload(user),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});

// ── onSessionWrite ────────────────────────────────────────────

/**
 * On session create, bump the parent pen's `totalSessions` and the
 * ink's `totalSessions` + `lastUsedAt`. On delete, decrement both.
 * On update, do nothing (metadata edits don't change counts).
 *
 * `onDocumentCreated` and `onDocumentDeleted` are separate triggers
 * because Firestore v2 doesn't have a single "write" trigger with
 * the change type.
 */
export const onSessionCreated = onDocumentCreated(
  'users/{uid}/sessions/{sid}',
  async (event) => {
    const { uid, sid } = event.params as { uid: string; sid: string };
    const session = event.data?.data() as SessionLike | undefined;
    if (!session) {
      console.warn(`onSessionCreated: missing data for ${uid}/${sid}`);
      return;
    }
    const deltas = applySessionDelta('create', session);
    if (!deltas) return;
    await Promise.all([
      bumpPenCounter(uid, session.penId, deltas.penDelta.delta),
      bumpInkCounter(uid, session.inkId, deltas.inkDelta.delta, admin.firestore.FieldValue.serverTimestamp()),
    ]);
  },
);

export const onSessionDeleted = onDocumentDeleted(
  'users/{uid}/sessions/{sid}',
  async (event) => {
    const { uid, sid } = event.params as { uid: string; sid: string };
    const session = event.data?.data() as SessionLike | undefined;
    if (!session) {
      console.warn(`onSessionDeleted: missing data for ${uid}/${sid}`);
      return;
    }
    const deltas = applySessionDelta('delete', session);
    if (!deltas) return;
    await Promise.all([
      bumpPenCounter(uid, session.penId, deltas.penDelta.delta),
      bumpInkCounter(uid, session.inkId, deltas.inkDelta.delta, null),
    ]);
  },
);

async function bumpPenCounter(uid: string, penId: string, delta: 1 | -1): Promise<void> {
  const ref = admin.firestore().doc(`users/${uid}/pens/${penId}`);
  const snap = await ref.get();
  if (!snap.exists) return; // Pen was deleted before its session.
  await ref.update({ totalSessions: admin.firestore.FieldValue.increment(delta) });
}

async function bumpInkCounter(
  uid: string,
  inkId: string,
  delta: 1 | -1,
  lastUsedAt: admin.firestore.FieldValue | null,
): Promise<void> {
  const ref = admin.firestore().doc(`users/${uid}/inks/${inkId}`);
  const snap = await ref.get();
  if (!snap.exists) return;
  const patch: Record<string, unknown> = {
    totalSessions: admin.firestore.FieldValue.increment(delta),
  };
  if (lastUsedAt !== null) patch.lastUsedAt = lastUsedAt;
  await ref.update(patch);
}

// ── monthlyStats ─────────────────────────────────────────────

/**
 * Scheduled job that pre-aggregates each user's sessions into
 * users/{uid}/stats/{YYYY-MM}. Runs once per day. Cheap because the
 * actual stats screen recomputes on the client too; this is just a
 * cache layer for the Settings → Stats navigation that wants to
 * render before the user's full session list is fetched.
 */
export const monthlyStats = onSchedule(
  { schedule: 'every day 00:00', timeZone: 'Etc/UTC' },
  async () => {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      await recomputeUserMonthlyStats(uid);
    }
  },
);

export async function recomputeUserMonthlyStats(uid: string): Promise<void> {
  const db = admin.firestore();
  const sessionsSnap = await db
    .collection(`users/${uid}/sessions`)
    .get();
  const sessions = sessionsSnap.docs.map((d) => {
    const data = d.data() as { date?: { toDate?: () => Date } | Date; durationMin?: number };
    const date: Date =
      data.date instanceof Date
        ? data.date
        : data.date?.toDate
          ? data.date.toDate()
          : new Date(0);
    return { date, durationMin: data.durationMin ?? 0 };
  });
  const buckets = computeMonthlyBuckets(sessions);
  const batch = db.batch();
  for (const b of buckets) {
    const ref = db.doc(`users/${uid}/stats/${b.key}`);
    batch.set(ref, { count: b.count, minutes: b.minutes, computedAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  await batch.commit();
}

// ── deleteUserData ────────────────────────────────────────────

const DeleteInputSchema = z.object({
  uid: z.string().min(1).max(128),
});

export const deleteUserData = onCall<{ uid: string }>(async (request) => {
  // Auth: only the user themselves can request their own deletion.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to delete your account.');
  }
  const parsed = DeleteInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }
  if (parsed.data.uid !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'You can only delete your own data.');
  }
  const uid = parsed.data.uid;
  return await performUserDataDeletion(uid);
});

export async function performUserDataDeletion(
  uid: string,
): Promise<{ docsDeleted: number; filesDeleted: number; authUserDeleted: boolean }> {
  const db = admin.firestore();
  const storage = admin.storage();
  const auth = admin.auth();
  const plan = planUserDataDeletion(uid);

  let docsDeleted = 0;
  for (const path of plan.firestorePaths) {
    const ref = db.doc(path);
    const snap = await ref.get();
    if (snap.exists) {
      // For collection refs, list + recursive delete. For doc refs,
      // just delete. The plan has only docs/collection-roots so the
      // simple delete + recursive path works.
      const collections = await ref.listCollections();
      for (const col of collections) {
        const colSnap = await col.get();
        const innerBatch = db.batch();
        colSnap.docs.forEach((d) => {
          innerBatch.delete(d.ref);
          docsDeleted += 1;
        });
        await innerBatch.commit();
      }
      await ref.delete();
      docsDeleted += 1;
    }
  }

  let filesDeleted = 0;
  const bucket = storage.bucket();
  for (const prefix of plan.storagePrefixes) {
    const [files] = await bucket.getFiles({ prefix });
    await Promise.all(
      files.map(async (f) => {
        await f.delete();
        filesDeleted += 1;
      }),
    );
  }

  let authUserDeleted = false;
  try {
    await auth.deleteUser(uid);
    authUserDeleted = true;
  } catch (err) {
    console.warn(`deleteUserData: auth.deleteUser(${uid}) failed:`, err);
  }

  return { docsDeleted, filesDeleted, authUserDeleted };
}
