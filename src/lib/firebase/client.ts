import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';

import { env } from '@/config/env';

/**
 * Firebase app configuration. Reads from `env` which is fed by EAS / Expo
 * Constants at build time — see `src/config/env.ts`. Values fall back to safe
 * dev placeholders so unit tests can run without real credentials.
 *
 * Memoised: repeated calls return the same object so consumers can use it
 * for stable equality checks.
 */
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

/**
 * Returns the singleton Firebase app. Idempotent — safe to call from anywhere.
 *
 * If a default app already exists (e.g. because some test setup pre-initialised
 * one), we return it without creating a second.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(getFirebaseOptions());
}
