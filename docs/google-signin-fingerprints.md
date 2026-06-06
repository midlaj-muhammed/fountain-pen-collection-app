# Google Sign-in — Android SHA fingerprints (P4.13c)

## Why

Google Play Services throws `DEVELOPER_ERROR 10` from
`GoogleSignin.signIn()` when the running APK's signing certificate
SHA-1 is **not** registered in the Firebase project's Android OAuth
client for that package id (`com.penapp.pen_app`).

The fingerprint currently in `google-services.json` (`15a0f98657dd793f3ae3e63994ebfa0263beffac`)
does not match the local debug keystore or the EAS build keystore,
so the dev-client APK can't complete the OAuth flow.

## What to do (one time)

Open the Firebase Console for the `pen-app-flutter` project:
https://console.firebase.google.com/project/pen-app-flutter/settings/general

Then: Your apps → **Android (com.penapp.pen_app)** → **SHA certificate
fingerprints** → **Add fingerprint**.

Add **all** of the following:

### 1. Local debug keystore (dev laptops, `pnpm android`)

```
SHA1:   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

(Source: this machine's `android/app/debug.keystore`.)

### 2. EAS dev-client / preview / production keystore

This is the keystore that signed the dev-client APK currently
installed on the test phone. EAS holds it in their cloud; we
extracted the fingerprints from the APK we just built:

```
SHA1:   A4:EE:F4:87:B5:77:B1:E3:D6:C9:73:32:8B:A8:9E:33:CC:C5:D4:6D
SHA256: 15:EC:0E:AE:7B:83:4C:04:75:5A:C1:3F:45:AF:FF:E8:B1:5C:25:BE:26:52:00:82:3C:AB:9B:D8:69:D8:58:41
```

(From: `keytool -printcert -jarfile /tmp/dev-client.apk` on
build `0997644d-5a78-4558-ae29-e2f50d93becd`.)

### 3. Release keystore (later, when you ship to Play Store)

Set up a release keystore with `eas build:configure` (or a manual
`keytool -genkey ...`). Then run:

```bash
./scripts/print-firebase-fingerprints.sh path/to/release.keystore my-alias
```

The script prints the SHA-1 / SHA-256 to register.

## How to verify

After registering, you do **not** need to re-build the APK — the
trust check happens at runtime against the registered fingerprints.

1. Reinstall or re-launch the existing dev-client APK on the phone.
2. Tap "Continue with Google" on the Sign-in screen.
3. The native account chooser should appear. Pick an account.
4. Firebase should accept the credential and land on the main tabs.

If you still see `DEVELOPER_ERROR`, double-check that:

- You added the **EAS** SHA-1 (not the local debug one). The two
  keystores are different.
- The package id in Firebase matches the package id in `app.json`
  (`com.penapp.pen_app`). A mismatch produces the same error.
- The web OAuth client id (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in
  `eas.json` + `src/config/env.ts`) matches the type-3 client
  registered in the Firebase project. We currently have it set to
  `913057838875-123hqo7cgtef4vel22v6r9qrc879v5jb.apps.googleusercontent.com`,
  which is the same one in `google-services.json` line 31.

## Automation

The helper script `scripts/print-firebase-fingerprints.sh` prints
the local debug keystore's fingerprints and explains how to fetch
the EAS one. Future projects: register fingerprints automatically
in CI once we have a Firebase service account with the right
roles.
