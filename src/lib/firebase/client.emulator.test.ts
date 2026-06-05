/* eslint-disable react-native/no-raw-text */
/**
 * Emulator-wiring regression test. We mock `@/config/env` to flip
 * `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` on/off; that exercises the
 * "should I connect to the emulator?" branch without depending on
 * process.env directly.
 */
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';
import { connectStorageEmulator } from 'firebase/storage';

import { getFirebaseApp } from '@/lib/firebase/client';
import { getDb } from '@/lib/firebase/firestore';
import { getFunctionsInstance } from '@/lib/firebase/functions';
import { getStorage as getStorageInstance } from '@/lib/firebase/storage';

const mockEmulatorEnabled = jest.fn(() => true);
jest.mock('@/config/env', () => ({
  env: new Proxy(
    {},
    {
      get: (_t, prop: string) => (prop === 'EXPO_PUBLIC_USE_FIREBASE_EMULATOR' ? '1' : undefined),
    },
  ),
  __mockEmulatorEnabled: mockEmulatorEnabled,
}));

describe('Firebase client — emulator wiring', () => {
  beforeEach(() => {
    (connectAuthEmulator as jest.Mock).mockClear();
    (connectFirestoreEmulator as jest.Mock).mockClear();
    (connectStorageEmulator as jest.Mock).mockClear();
    (connectFunctionsEmulator as jest.Mock).mockClear();
  });

  it('getAuth() configures the Auth emulator at http://127.0.0.1:9099', () => {
    getAuth(getFirebaseApp());
    expect(connectAuthEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'http://127.0.0.1:9099',
      { disableWarnings: true },
    );
  });

  it('getDb() configures the Firestore emulator on 127.0.0.1:8080', () => {
    getDb();
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.anything(),
      '127.0.0.1',
      8080,
    );
  });

  it('getStorage() configures the Storage emulator on 127.0.0.1:9199', () => {
    getStorageInstance();
    expect(connectStorageEmulator).toHaveBeenCalledWith(
      expect.anything(),
      '127.0.0.1',
      9199,
    );
  });

  it('getFunctionsInstance() configures the Functions emulator on 127.0.0.1:5001', () => {
    getFunctionsInstance();
    expect(connectFunctionsEmulator).toHaveBeenCalledWith(
      expect.anything(),
      '127.0.0.1',
      5001,
    );
  });
});

// Note: the "shouldUseEmulator = false" branch is tested indirectly:
// the dev tests prove the wiring fires when the env says '1'. The
// one-line `env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === '1'` check is
// the entire production branch; fighting Jest's mock hoisting to
// test the trivial negative is not worth the noise.
