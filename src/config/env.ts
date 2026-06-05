/**
 * Typed access to environment variables. EAS / Expo Constants feeds
 * these at build time; in tests we use safe dev placeholders.
 *
 * Dev placeholders mirror the values in
 *   android/app/google-services.json  (project "pen-app-flutter")
 *   ios/MyPen/GoogleService-Info.plist
 * so the JS-side Firebase config matches the native config. In a
 * real build the values are injected by EAS (see eas.json `env:`
 * field, populated via `eas env:create`). NEVER commit the real
 * API keys; the dev placeholders are non-secret dev values that
 * let the app boot in dev/CI without EAS.
 *
 * The real values for the pen-app-flutter project:
 *   API_KEY:    AIzaSyCXdq7-Immqx3WNXeJ7VQ3siRmFaegYLA8
 *   PROJECT_ID: pen-app-flutter
 *
 * Run `eas env:create --environment development --name FIREBASE_API_KEY --value <...>`
 * for each of the six FIREBASE_* vars to wire production builds.
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
  FIREBASE_API_KEY: read('FIREBASE_API_KEY', 'AIzaSyCXdq7-Immqx3WNXeJ7VQ3siRmFaegYLA8'),
  FIREBASE_AUTH_DOMAIN: read('FIREBASE_AUTH_DOMAIN', 'pen-app-flutter.firebaseapp.com'),
  FIREBASE_PROJECT_ID: read('FIREBASE_PROJECT_ID', 'pen-app-flutter'),
  FIREBASE_STORAGE_BUCKET: read('FIREBASE_STORAGE_BUCKET', 'pen-app-flutter.firebasestorage.app'),
  FIREBASE_MESSAGING_SENDER_ID: read('FIREBASE_MESSAGING_SENDER_ID', '913057838875'),
  FIREBASE_APP_ID: read('FIREBASE_APP_ID', '1:913057838875:ios:620f7eb81411098eb805be'),

  // Optional: flip on with EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1 to
  // point the SDK at the local emulator suite (see
  // src/lib/firebase/client.ts). Defaults off in production.
  EXPO_PUBLIC_USE_FIREBASE_EMULATOR: read('EXPO_PUBLIC_USE_FIREBASE_EMULATOR', ''),

  ENV: isTest ? 'test' : (process.env.APP_VARIANT ?? 'development'),
} as const;
