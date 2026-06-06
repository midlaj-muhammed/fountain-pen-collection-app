import {
  type CollectionReference,
  type Firestore,
  type FirestoreSettings,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

import { EMULATOR_HOST, EMULATOR_PORTS, getFirebaseApp, shouldUseEmulator } from './client';

let _db: Firestore | null = null;
let _emulatorWired = false;

/**
 * Returns the singleton Firestore instance, configured with
 * `persistentLocalCache` (the v9+ replacement for the deprecated
 * `enableIndexedDbPersistence`). On React Native, the SDK stores
 * the cache in its own native layer — there's no separate
 * IndexedDB step, so the "missing IndexedDB" warning we saw on
 * RN is gone with the new API.
 *
 * `initializeFirestore` is the *only* entry point that takes
 * `FirestoreSettings.cache`. `getFirestore` does not — calling it
 * after init returns the same instance with the cache already
 * configured. We call it once on the first `getDb()` and cache.
 */
export function getDb(): Firestore {
  if (!_db) {
    // `cache` is a v9+ FirestoreSettings field; the public
    // @firebase/firestore type doesn't include it yet, but the
    // runtime honours it. Cast through `unknown` so the call site
    // compiles without `as any`.
    const settings = {
      cache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    } as unknown as FirestoreSettings;
    try {
      _db = initializeFirestore(getFirebaseApp(), settings);
    } catch {
      // Already initialised (e.g. Fast Refresh re-ran this module).
      // getFirestore returns the same instance with the same
      // settings — the cache stays configured.
      _db = getFirestore(getFirebaseApp());
    }
  }
  if (!_emulatorWired && shouldUseEmulator()) {
    connectFirestoreEmulator(_db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
    _emulatorWired = true;
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

// Kept as a no-op for back-compat with callers that used to call
// `enableOfflinePersistence()`. The new persistentLocalCache is
// configured at `initializeFirestore` time inside `getDb()` and
// doesn't need a separate enable step. We keep the symbol so
// existing import sites don't break.
export async function enableOfflinePersistence(): Promise<void> {
  return Promise.resolve();
}
