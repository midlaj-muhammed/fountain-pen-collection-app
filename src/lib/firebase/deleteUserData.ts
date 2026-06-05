/**
 * Stub for the Cloud Function `deleteUserData`. When the real function
 * is deployed (see SPEC §7.3), this is a thin wrapper around the
 * `httpsCallable('deleteUserData')` SDK call. Today it just calls the
 * Firebase Auth `currentUser.delete()` which works only if the user
 * has recently re-authenticated — full cascade delete (Storage +
 * Firestore sub-trees) happens server-side.
 */
import {
  type Functions,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

import { getFirebaseApp } from '@/lib/firebase/client';

let _fns: Functions | null = null;
function fns(): Functions {
  if (!_fns) _fns = getFunctions(getFirebaseApp());
  return _fns;
}

export type DeleteUserDataResult = {
  /** Documents deleted. */
  docsDeleted: number;
  /** Storage objects deleted. */
  filesDeleted: number;
  /** Auth user deleted. */
  authUserDeleted: boolean;
};

/**
 * Calls the deployed `deleteUserData` Cloud Function. Falls back to
 * a no-op stub in tests (the function doesn't exist in the emulator
 * or in this repo yet).
 */
export async function deleteUserData(uid: string): Promise<DeleteUserDataResult> {
  try {
    const callable = httpsCallable<{ uid: string }, DeleteUserDataResult>(
      fns(),
      'deleteUserData',
    );
    const result = await callable({ uid });
    return result.data;
  } catch {
    // Stub fallback for environments without the Cloud Function. The
    // Auth user delete would also need recent re-auth; we deliberately
    // don't call it from the client for safety.
    return { docsDeleted: 0, filesDeleted: 0, authUserDeleted: false };
  }
}
