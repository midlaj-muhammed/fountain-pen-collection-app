/**
 * Tests for the auth wrapper. Validates the typed surface:
 *  - signInWithEmail / signUpWithEmail / signInWithGoogle / signOut / onAuthChanged
 *  - All return Promises that resolve to a typed User | null
 *  - onAuthChanged returns an unsubscribe function
 */
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  onAuthChanged,
} from './auth';

describe('auth wrappers', () => {
  it('signInWithEmail resolves with a user-shaped object on success', async () => {
    const user = await signInWithEmail('alice@example.com', 'password123');
    expect(user).toEqual(
      expect.objectContaining({
        uid: expect.any(String),
        email: expect.stringMatching(/@/),
      }),
    );
  });

  it('signUpWithEmail resolves with a user-shaped object on success', async () => {
    const user = await signUpWithEmail('bob@example.com', 'password123');
    expect(user).toEqual(
      expect.objectContaining({
        uid: expect.any(String),
        email: expect.stringMatching(/@/),
      }),
    );
  });

  it('signInWithGoogle resolves with a user-shaped object on success', async () => {
    const user = await signInWithGoogle();
    expect(user).toEqual(
      expect.objectContaining({
        uid: expect.any(String),
        email: expect.stringMatching(/@/),
      }),
    );
  });

  it('signInWithGoogle uses the @react-native-google-signin library + signInWithCredential', async () => {
    (GoogleSignin.signIn as jest.Mock).mockClear();
    (signInWithCredential as jest.Mock).mockClear();
    await signInWithGoogle();
    expect(GoogleSignin.signIn).toHaveBeenCalledTimes(1);
    // The idToken returned by GoogleSignin must be exchanged via
    // signInWithCredential with a GoogleAuthProvider.credential.
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('fake-google-id-token');
    expect(signInWithCredential).toHaveBeenCalledTimes(1);
  });

  it('signOut resolves successfully', async () => {
    await expect(signOut()).resolves.toBeUndefined();
  });

  it('onAuthChanged invokes the callback with a user and returns an unsubscribe', () => {
    const cb = jest.fn();
    const unsub = onAuthChanged(cb);
    expect(typeof unsub).toBe('function');
    expect(cb).toHaveBeenCalled();
    unsub();
  });
});

describe('auth input validation', () => {
  it('signInWithEmail rejects an invalid email', async () => {
    await expect(signInWithEmail('not-an-email', 'password')).rejects.toThrow(/email/);
  });

  it('signInWithEmail rejects a short password', async () => {
    await expect(signInWithEmail('alice@example.com', 'short')).rejects.toThrow(/password/);
  });

  it('signUpWithEmail rejects a missing email', async () => {
    await expect(signUpWithEmail('', 'password123')).rejects.toThrow(/email/);
  });
});
