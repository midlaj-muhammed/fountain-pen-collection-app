/**
 * Typed access to environment variables. EAS / Expo Constants feeds these at
 * build time; in tests we use safe dev placeholders.
 *
 * The real values are injected by EAS at build time (see eas.json
 * `env:` field, populated via `eas env:create`). NEVER commit real keys.
 */

const isTest = process.env.NODE_ENV === 'test';

function read(key: string, fallback: string): string {
  // Tests run with NODE_ENV=test and we want deterministic, non-secret values
  // that still satisfy the shape Firebase expects.
  if (isTest) return fallback;
  // In a real build, the value is set by EAS (e.g. FIREBASE_API_KEY).
  // Fall back to a placeholder so the app still boots without EAS config.
  return process.env[key] ?? fallback;
}

export const env = {
  FIREBASE_API_KEY: read('FIREBASE_API_KEY', 'test-api-key'),
  FIREBASE_AUTH_DOMAIN: read('FIREBASE_AUTH_DOMAIN', 'mypen-dev.firebaseapp.com'),
  FIREBASE_PROJECT_ID: read('FIREBASE_PROJECT_ID', 'mypen-dev'),
  FIREBASE_STORAGE_BUCKET: read('FIREBASE_STORAGE_BUCKET', 'mypen-dev.appspot.com'),
  FIREBASE_MESSAGING_SENDER_ID: read('FIREBASE_MESSAGING_SENDER_ID', '0000000000'),
  FIREBASE_APP_ID: read('FIREBASE_APP_ID', '1:0000000000:web:0000000000000000'),

  ENV: isTest ? 'test' : (process.env.APP_VARIANT ?? 'development'),
} as const;
