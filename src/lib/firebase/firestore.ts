import {
  type CollectionReference,
  type Firestore,
  collection,
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

/**
 * Enables Firestore offline persistence. The real implementation in P3.8
 * (Slice S8) will wrap this with cache size + multi-tab-disabled settings.
 *
 * For now this is a no-op so callers can wire the call site today.
 */
export function enableOfflinePersistence(): void {
  // P3.8 will fill this in. Keeping the function exported so call sites
  // don't have to change.
}
