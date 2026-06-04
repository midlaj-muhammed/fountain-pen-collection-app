/**
 * Tests for the Firebase client. The native SDK is mocked in jest.setup.js
 * so we can run these in CI without a real Firebase project.
 */
import { getApp, getApps } from 'firebase/app';

import { getFirebaseApp, getFirebaseOptions } from './client';

describe('getFirebaseOptions', () => {
  it('returns a config object with all required keys', () => {
    const opts = getFirebaseOptions();
    expect(opts).toEqual(
      expect.objectContaining({
        apiKey: expect.any(String),
        authDomain: expect.any(String),
        projectId: expect.any(String),
        storageBucket: expect.any(String),
        messagingSenderId: expect.any(String),
        appId: expect.any(String),
      }),
    );
  });

  it('returns the same object on repeated calls (memoised)', () => {
    const a = getFirebaseOptions();
    const b = getFirebaseOptions();
    expect(a).toBe(b);
  });
});

describe('getFirebaseApp', () => {
  it('returns the same app on repeated calls (singleton)', () => {
    const app1 = getFirebaseApp();
    const app2 = getFirebaseApp();
    expect(app1).toBe(app2);
  });

  it('returns an app that matches the one returned by the raw SDK', () => {
    const app = getFirebaseApp();
    expect(app).toBe(getApp());
  });

  it('uses the default app if one is already initialized', () => {
    // Simulate Firebase being initialized elsewhere (e.g. by a tests setup)
    const before = getApps().length;
    const app = getFirebaseApp();
    const after = getApps().length;
    expect(after).toBe(before);
    expect(app).toBeDefined();
  });
});
