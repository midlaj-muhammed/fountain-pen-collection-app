import {
  type CollectionReference,
  type Firestore,
  collection,
  enableIndexedDbPersistence,
  getFirestore,
} from 'firebase/firestore';

import { getFirebaseApp } from './client';

/** Singleton Firestore instance. Lazy-initialised from the Firebase app. */
let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

/**
 * Build a typed collection reference for a user's subcollection.
 *
 *   userCollection(uid, 'pens')   → users/{uid}/pens
 *   userCollection(uid, 'inks')   → users/{uid}/inks
 *   userCollection(uid, 'sessions') → users/{uid}/sessions
 *
 * Throws if either argument is empty — the security rules in firestore.rules
 * require a uid, and an empty subcollection name would point at the user doc.
 */
export function userCollection<Doc = unknown>(
  uid: string,
  subcollection: string,
): CollectionReference<Doc> {
  if (!uid) throw new Error('userCollection: uid must be a non-empty string');
  if (!subcollection) throw new Error('userCollection: subcollection must be a non-empty string');
  return collection(getDb(), 'users', uid, subcollection) as CollectionReference<Doc>;
}

let _persistenceEnabled = false;
let _persistencePromise: Promise<void> | null = null;

/**
 * Enables Firestore offline persistence (IndexedDB on web, native on
 * RN). Idempotent: safe to call multiple times. Subsequent calls
 * return the same in-flight promise. Logs a warning (rather than
 * throwing) if the SDK rejects — common cases are "already
 * initialized in another tab" or "running in SSR".
 */
export function enableOfflinePersistence(): Promise<void> {
  if (_persistenceEnabled) return Promise.resolve();
  if (_persistencePromise) return _persistencePromise;
  _persistencePromise = enableIndexedDbPersistence(getDb()).then(
    () => {
      _persistenceEnabled = true;
    },
    (err: unknown) => {
      // Common: "failed-precondition: already enabled in another tab".
      // We treat that as success for the local tab so callers can
      // still rely on the persistence being on.
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code?: string }).code;
        if (code === 'failed-precondition' || code === 'unimplemented') {
          _persistenceEnabled = true;
          return;
        }
      }
      // eslint-disable-next-line no-console
      console.warn('[firestore] enableIndexedDbPersistence failed:', err);
      _persistencePromise = null;
    },
  );
  return _persistencePromise;
}

