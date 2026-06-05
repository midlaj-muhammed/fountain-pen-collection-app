# P4.13b — Google Sign-in (real)

The JS-side `signInWithGoogle` previously used `signInWithPopup`,
which is a **web** flow. On iOS / Android, the same flow goes
through the native `@react-native-google-signin/google-signin`
library, which handles the OS account chooser, captures the Google
idToken, and hands it back to JS. We then exchange the idToken for
a Firebase credential via `signInWithCredential(auth, credential)`.

## Flow

```
┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
│ GoogleSignin.signIn()│→ │ idToken              │→ │ signInWithCredential│
│ (native UI)          │  │                      │  │ (Firebase Auth)     │
└─────────────────────┘  └─────────────────────┘  └────────────────────┘
        iOS / Android            JS                     Firebase
```

## Setup

### 1. Install the package

```bash
pnpm add @react-native-google-signin/google-signin
```

### 2. Configure the client id at app start

The library auto-discovers the iOS / Android client id from
`GoogleService-Info.plist` / `google-services.json` (the same files
we set up in P4.11). For Expo, the recommended pattern is to
`GoogleSignin.configure()` once in your entry file. Add this to
`src/app/App.tsx` or a similar init point:

```ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

useEffect(() => {
  GoogleSignin.configure();
}, []);
```

### 3. Native build

```bash
pnpm prebuild      # expo prebuild + apply-firebase-configs.sh
pnpm ios           # or: pnpm android
```

The library is a native module, so a real `pod install` + native
build is required. The unit tests cover the JS side (mocking the
library) but the real-device test must be on a simulator or
hardware.

### 4. Bundle id match

The iOS bundle id in `app.json` and Android package in `app.json`
must match the OAuth client id registered in the Firebase console.
Today: `com.penapp.penApp` (iOS) + `com.penapp.pen_app` (Android).
If you ever change them, you must also re-register the bundle in
the Firebase console. The `eas.json.test.ts` + `src/config/env.test.ts`
regression guards catch drift between `app.json` and the native
config files.

## API used

- `GoogleSignin.signIn()` → `{ type: 'success', data: { idToken, user } }` (v16)
- `GoogleAuthProvider.credential(idToken)` (static method on the class)
- `signInWithCredential(auth, credential)` from `firebase/auth`

## Tests

`src/lib/firebase/auth.test.ts`:
- `signInWithGoogle resolves with a user-shaped object` — happy path
- `signInWithGoogle uses @react-native-google-signin + signInWithCredential` —
  regression: asserts the new flow is used, not the old `signInWithPopup`
- `signInWithGoogle throws when the idToken is missing` (implicit via
  the type check on `response.type === 'success'`)

`jest.setup.js` mocks `@react-native-google-signin/google-signin` so
the test suite runs without a native module.

## Known caveats

- **Re-auth on iOS**: Google Sign-in may return a stale credential.
  The library calls `GoogleSignin.signIn()` which always shows the
  account picker; call `GoogleSignin.signOut()` (already wired in
  our `signOut()`) to clear the cached session.
- **Cancelled sign-in**: the response is `{ type: 'cancelled' }`.
  Today we throw. A future polish pass should catch the cancel
  specifically and route to the Welcome screen with a non-error
  toast.
- **Web sign-in**: this flow is iOS/Android only. The web build
  (`pnpm web`) is explicitly disabled in package.json, so this
  isn't a regression risk today.

## References

- Library: https://github.com/react-native-google-signin/google-signin
- Firebase `signInWithCredential`: https://firebase.google.com/docs/auth/web/manage-users
- Bundle id wiring: see `a5744b4` (P4.11) for the rename history
