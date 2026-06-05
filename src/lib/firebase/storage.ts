import {
  type FirebaseStorage,
  type StorageReference,
  connectStorageEmulator,
  deleteObject,
  getDownloadURL,
  getStorage as fbGetStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

import { EMULATOR_HOST, EMULATOR_PORTS, getFirebaseApp, shouldUseEmulator } from './client';

let _storage: FirebaseStorage | null = null;
let _emulatorWired = false;

export function getStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = fbGetStorage(getFirebaseApp());
  }
  if (!_emulatorWired && shouldUseEmulator()) {
    connectStorageEmulator(_storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
    _emulatorWired = true;
  }
  return _storage;
}

function refFromPath(path: string): StorageReference {
  return ref(getStorage(), path);
}

/**
 * Upload a file to the given path and return its public download URL.
 * Used for pen photos, ink photos, and avatars.
 */
export async function uploadFile(path: string, blob: Blob): Promise<string> {
  const r = refFromPath(path);
  await uploadBytes(r, blob);
  return getDownloadURL(r);
}

/** Delete a file by path. Throws if the file does not exist. */
export async function deleteFile(path: string): Promise<void> {
  await deleteObject(refFromPath(path));
}

// ── Path builders (per SPEC §7.6) ─────────────────────────
// /avatars/{uid}/{file}                — read public, write owner-only
// /photos/pens/{uid}/{penId}/{file}     — owner-only
// /photos/inks/{uid}/{inkId}/{file}     — owner-only

export const penPhotoPath = (uid: string, penId: string, fileName: string) =>
  `photos/pens/${uid}/${penId}/${fileName}`;

export const inkPhotoPath = (uid: string, inkId: string, fileName: string) =>
  `photos/inks/${uid}/${inkId}/${fileName}`;

export const avatarPath = (uid: string, fileName: string) => `avatars/${uid}/${fileName}`;
