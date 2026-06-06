/**
 * Pure business logic for Cloud Functions. No firebase-admin here —
 * the wrappers in index.ts pass admin SDK objects into these
 * functions, keeping the math unit-testable without a live emulator.
 */

export type SessionChangeType = 'create' | 'update' | 'delete';

export type SessionLike = {
  penId: string;
  inkId: string;
};

export type CounterDelta = {
  id: string;
  delta: 1 | -1;
};

/**
 * Given a session change, return the pen + ink counter deltas
 * (or null for update — counters don't change on metadata edits).
 */
export function applySessionDelta(
  change: SessionChangeType,
  session: SessionLike,
): { penDelta: CounterDelta; inkDelta: CounterDelta } | null {
  if (change === 'update') return null;
  const delta: 1 | -1 = change === 'create' ? 1 : -1;
  return {
    penDelta: { id: session.penId, delta },
    inkDelta: { id: session.inkId, delta },
  };
}

/** "YYYY-MM" key for a date in UTC. */
export function bucketForMonth(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export type SessionForBucket = {
  date: Date;
  durationMin: number;
};

export type MonthlyBucket = {
  key: string;
  count: number;
  minutes: number;
};

/** Group sessions into YYYY-MM buckets, newest first. */
export function computeMonthlyBuckets(sessions: SessionForBucket[]): MonthlyBucket[] {
  const map = new Map<string, MonthlyBucket>();
  for (const s of sessions) {
    const key = bucketForMonth(s.date);
    const existing = map.get(key) ?? { key, count: 0, minutes: 0 };
    existing.count += 1;
    existing.minutes += s.durationMin;
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

export type DeletionPlan = {
  /** Top-level Firestore docs/collections to delete for the user. */
  firestorePaths: string[];
  /** Storage prefixes whose contents should be deleted. */
  storagePrefixes: string[];
};

/**
 * Plan the cascade delete for a user. Returns the list of paths to
 * pass to the admin SDK (recursive delete + Storage list/delete).
 * Kept as a pure function so tests don't need to mock admin.
 */
export function planUserDataDeletion(uid: string): DeletionPlan {
  return {
    firestorePaths: [
      `users/${uid}`,
      `users/${uid}/pens`,
      `users/${uid}/inks`,
      `users/${uid}/sessions`,
    ],
    storagePrefixes: [
      `users/${uid}/`,
    ],
  };
}

/**
 * The settings block seeded into users/{uid} on first auth. Kept
 * in lockstep with the client-side default in
 * `src/app/providers/AuthProvider.tsx`.
 */
export const defaultUserSettings = {
  theme: 'system' as const,
  fontSize: 'md' as const,
  reminderEnabled: false,
  reminderHour: 20,
  reorderAlertEnabled: true,
};

export type UserSeedInput = {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
};

/**
 * Build the user-doc payload that the onUserCreated trigger
 * writes. Pure function (the `serverTimestamps` are passed in
 * by the caller so this stays unit-testable without a live
 * Firestore). The shape mirrors the client `User` domain type
 * minus the server-side timestamps the wrapper injects.
 */
export function defaultUserDocPayload(u: UserSeedInput): {
  displayName: string;
  email: string;
  photoURL: string | null;
  emailVerified: boolean;
  plan: 'free';
  settings: typeof defaultUserSettings;
} {
  return {
    displayName: u.displayName ?? '',
    email: u.email ?? '',
    photoURL: u.photoURL ?? null,
    emailVerified: !!u.emailVerified,
    plan: 'free',
    settings: defaultUserSettings,
  };
}
