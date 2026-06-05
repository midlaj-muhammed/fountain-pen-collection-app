/**
 * Regression test: the JS-side env values must match the native
 * configs at android/app/google-services.json and
 * ios/MyPen/GoogleService-Info.plist. A drift between them
 * silently breaks Google Sign-in's OAuth flow.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { env } from './env';

const android = JSON.parse(
  readFileSync(join(__dirname, '../../android/app/google-services.json'), 'utf8'),
) as {
  project_info: { project_id: string; project_number: string; firebase_url: string };
  client: {
    client_info: { mobilesdk_app_id: string };
    api_key: { current_key: string }[];
  }[];
};

const ios = (() => {
  const plist = readFileSync(
    join(__dirname, '../../ios/MyPen/GoogleService-Info.plist'),
    'utf8',
  );
  const get = (key: string) => {
    const m = plist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`));
    return m ? m[1] : null;
  };
  return {
    PROJECT_ID: get('PROJECT_ID'),
    API_KEY: get('API_KEY'),
    GOOGLE_APP_ID: get('GOOGLE_APP_ID'),
    GCM_SENDER_ID: get('GCM_SENDER_ID'),
    BUNDLE_ID: get('BUNDLE_ID'),
  };
})();

describe('env — matches native Firebase configs', () => {
  it('FIREBASE_PROJECT_ID matches the project id in google-services.json', () => {
    expect(env.FIREBASE_PROJECT_ID).toBe(android.project_info.project_id);
  });

  it('FIREBASE_PROJECT_ID matches the PROJECT_ID in GoogleService-Info.plist', () => {
    expect(env.FIREBASE_PROJECT_ID).toBe(ios.PROJECT_ID);
  });

  it('FIREBASE_API_KEY matches the iOS GoogleService-Info.plist (the platform app.json is configured for)', () => {
    expect(env.FIREBASE_API_KEY).toBe(ios.API_KEY);
  });

  it('android google-services.json has its own (different) API key for the same project', () => {
    // The two native configs share project_id + messaging_sender_id
    // but each has its own API key. Both are valid; the JS env holds
    // the iOS one (matching the iOS bundle id in app.json).
    const androidKey = android.client[0]?.api_key[0]?.current_key;
    expect(androidKey).toBeTruthy();
    expect(androidKey).not.toBe(ios.API_KEY);
  });

  it('FIREBASE_APP_ID matches the GOOGLE_APP_ID in GoogleService-Info.plist', () => {
    expect(env.FIREBASE_APP_ID).toBe(ios.GOOGLE_APP_ID);
  });

  it('FIREBASE_MESSAGING_SENDER_ID matches the project_number (GCM_SENDER_ID)', () => {
    expect(env.FIREBASE_MESSAGING_SENDER_ID).toBe(android.project_info.project_number);
    expect(env.FIREBASE_MESSAGING_SENDER_ID).toBe(ios.GCM_SENDER_ID);
  });

  it('app.json bundle ids match the native configs', () => {
    const app = JSON.parse(readFileSync(join(__dirname, '../../app.json'), 'utf8')) as {
      expo: { ios: { bundleIdentifier: string }; android: { package: string } };
    };
    expect(app.expo.ios.bundleIdentifier).toBe(ios.BUNDLE_ID);
    const androidClient = android.client[0]?.client_info as
      | { android_client_info?: { package_name: string } }
      | undefined;
    expect(app.expo.android.package).toBe(androidClient?.android_client_info?.package_name);
  });
});
