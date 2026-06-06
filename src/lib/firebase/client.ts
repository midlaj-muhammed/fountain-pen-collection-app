import { getReactNativePersistence, initializeAuth } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
// `initializeAuth` and `getReactNativePersistence` come from the
// platform-conditional `@firebase/auth` entry rather than the public
// `firebase/auth`. The latter resolves to the node-platform build,
// whose `initializeAuth` runs an internal assertion that fails when
// handed a custom React Native persistence adapter
// ("INTERNAL ASSERTION FAILED: Expected a class definition").
// `@firebase/auth` has a `react-native` conditional export that
// Metro resolves to the RN-platform entry (`dist/rn/index.js`)
// which knows how to use a `Persistence` object with
// `get`/`set`/`remove` methods backed by AsyncStorage. The other
// auth functions (`getAuth`, `connectAuthEmulator`, etc.) are
// platform-neutral and still come from the public `firebase/auth`.
import { type Auth, connectAuthEmulator, getAuth } from 'firebase/auth';

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
let _auth: Auth | null = null;
let _authEmulatorWired = false;

/**
 * Lazily-initialised Auth instance with AsyncStorage-backed
 * persistence. We use the React-Native-platform `initializeAuth` +
 * `getReactNativePersistence` rather than the default `getAuth` so
 * the signed-in user survives app restarts; without this, every
 * cold start forces the user back through the sign-in flow.
 *
 * `initializeAuth` throws if called twice on the same app, which
 * happens on Fast Refresh during dev. We guard with the module-
 * level `_auth` so the second call returns the existing instance.
 *
 * The shared helper is also exported as `getFirebaseAuth()` so other
 * modules (firestore, storage, functions) can reuse the same auth
 * instance with the persistence layer already configured.
 */
export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  // Resolve the app without going through getFirebaseApp() (which
  // calls back into auth); we just need an app to attach auth to.
  const app: FirebaseApp = _app
    ? _app
    : (getApps().length > 0
        ? getApp()
        : initializeApp(getFirebaseOptions()));
  _app = app;
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialised (e.g. Fast Refresh re-ran the module).
    // Fall back to getAuth which returns the bound instance.
    _auth = getAuth(app);
  }
  return _auth;
}

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApp();
    } else {
      _app = initializeApp(getFirebaseOptions());
    }
  }

  // Wire auth with AsyncStorage persistence at app start. We don't
  // need the return value here; other modules call getFirebaseAuth()
  // directly. Calling it here ensures the persistence layer is
  // attached before any auth call (signIn / signOut) happens.
  getFirebaseAuth();

  // Idempotent emulator wiring — the SDK throws on double-connect for
  // some services, so we guard with a flag. Runs after the app is
  // resolved so a pre-initialised app (e.g. from a test setup) still
  // gets wired.
  if (shouldUseEmulator() && !_authEmulatorWired) {
    // Auth takes a full URL (http://host:port); Firestore/Storage/
    // Functions take host + port separately. The SDK's signature
    // differs across services.
    connectAuthEmulator(
      getFirebaseAuth(),
      `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`,
      { disableWarnings: true },
    );
    _authEmulatorWired = true;
  }
  return _app;
}
