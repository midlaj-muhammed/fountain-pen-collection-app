/**
 * Regression test: eas.json must declare every FIREBASE_* secret in
 * every build profile's `env` block. Without this, `eas env:create`
 * has nowhere to put the values and the production build silently
 * uses the dev placeholders baked into src/config/env.ts.
 *
 * Today: no env block exists in eas.json. This test fails (RED).
 * After the fix to eas.json: this test passes.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const eas = JSON.parse(readFileSync(join(__dirname, 'eas.json'), 'utf8')) as {
  build: Record<string, { env?: Record<string, string> }>;
};

const REQUIRED_FIREBASE_VARS = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

const PROFILES = ['base', 'development', 'preview', 'production'];

describe('eas.json — env wiring', () => {
  it.each(PROFILES)('profile "%s" declares every FIREBASE_* var', (profile) => {
    const env = eas.build[profile]?.env ?? {};
    for (const key of REQUIRED_FIREBASE_VARS) {
      expect(env).toHaveProperty(key);
    }
  });

  it('the "base" env includes EXPO_PUBLIC_USE_FIREBASE_EMULATOR (defaults to "")', () => {
    const baseEnv = eas.build.base?.env ?? {};
    expect(baseEnv).toHaveProperty('EXPO_PUBLIC_USE_FIREBASE_EMULATOR');
  });
});
