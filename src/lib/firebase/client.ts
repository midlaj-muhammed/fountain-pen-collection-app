import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

import { env } from '@/config/env';

/**
 * Whether the Firebase client should connect to the local emulator
 * suite instead of the real project. Opt-in via the
 * `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1` env var (the .env file or
 * the EAS dev profile sets it for local development). Production
 * builds leave the var unset and use the real project.
 *
 * Reads from `env` (typed env access) so tests can mock the env
 * module instead of mutating process.env directly.
 */
export function shouldUseEmulator(): boolean {
  // env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR is added to the env shape
  // in dev/test; production omits the var.
  return (env as Record<string, string | undefined>).EXPO_PUBLIC_USE_FIREBASE_EMULATOR === '1';
}

/** Standard Firebase emulator host (loopback). */
export const EMULATOR_HOST = '127.0.0.1';
/** Per-service emulator ports. Must match firebase.json. */
export const EMULATOR_PORTS = {
  auth: 9099,
  functions: 5001,
  firestore: 8080,
  storage: 9199,
} as const;

let _options: FirebaseOptions | null = null;
export function getFirebaseOptions(): FirebaseOptions {
  if (!_options) {
    _options = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    };
  }
  return _options;
}

let _app: FirebaseApp | null = null;
let _authEmulatorWired = false;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApp();
    } else {
      _app = initializeApp(getFirebaseOptions());
    }
  }
  // Idempotent emulator wiring — the SDK throws on double-connect for
  // some services, so we guard with a flag. Runs after the app is
  // resolved so a pre-initialised app (e.g. from a test setup) still
  // gets wired.
  if (shouldUseEmulator() && !_authEmulatorWired) {
    // Auth takes a full URL (http://host:port); Firestore/Storage/
    // Functions take host + port separately. The SDK's signature
    // differs across services.
    connectAuthEmulator(
      getAuth(_app),
      `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`,
      { disableWarnings: true },
    );
    _authEmulatorWired = true;
  }
  return _app;
}
