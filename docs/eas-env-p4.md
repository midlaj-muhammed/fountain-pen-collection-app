# P4.13c — EAS env wiring + emulator smoke

The JS-side env (`src/config/env.ts`) reads the 6 `FIREBASE_*`
vars at runtime. The dev placeholders in `env.ts` work for local
builds, but production builds must override them via EAS secrets.

`eas.json` declares the env block in every build profile
(`base` + `development` + `preview` + `production`) with empty
defaults. `eas env:create` then writes the real values into the
empty slots per profile. Empty defaults make it impossible to ship
a profile that silently uses the dev placeholder.

## One-time setup (per project, run from the repo root)

```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Link the local repo to the EAS project (one-time)
eas init --id <your-eas-project-id>
# or: eas init

# Create one set of dev secrets. Run for each of the 6 vars.
eas env:create --environment development --name FIREBASE_API_KEY              --value "AIzaSy..."
eas env:create --environment development --name FIREBASE_AUTH_DOMAIN        --value "pen-app-flutter.firebaseapp.com"
eas env:create --environment development --name FIREBASE_PROJECT_ID        --value "pen-app-flutter"
eas env:create --environment development --name FIREBASE_STORAGE_BUCKET     --value "pen-app-flutter.firebasestorage.app"
eas env:create --environment development --name FIREBASE_MESSAGING_SENDER_ID --value "913057838875"
eas env:create --environment development --name FIREBASE_APP_ID             --value "1:913057838875:ios:620f7eb81411098eb805be"

# Repeat for --environment preview and --environment production.
# (The --value comes from the Firebase console each time.)

# Optional: flip the dev profile to talk to the local emulator suite
eas env:update --environment development --name EXPO_PUBLIC_USE_FIREBASE_EMULATOR --value "1"
```

## Emulator smoke test

`scripts/smoke-firebase-emulator.sh` boots the Firebase emulator
suite + the new Cloud Functions + writes a test session doc +
asserts that the counter side-effects fire.

```bash
# 1. Boot the emulator suite (in one terminal)
cd functions
pnpm run serve
#   i  emulators: auth, functions, firestore, storage, ui
#   ✔  All emulators ready!

# 2. In another terminal, run the smoke
cd functions
./scripts/smoke-firebase-emulator.sh
#   ✓ Auth emulator reachable on :9099
#   ✓ Firestore emulator reachable on :8080
#   ✓ Function onSessionCreated fired: pen.totalSessions = 1
#   ✓ Function onSessionDeleted fired: pen.totalSessions = 0
#   ✓ Function deleteUserData fired: docsDeleted=4, filesDeleted=N
#   ✓ All assertions passed.
```

The smoke script:
1. Curls the Auth + Firestore emulator health endpoints.
2. Inserts a pen + ink + session via the Firestore REST API.
3. Waits 1s for `onSessionCreated` to fire; reads the pen back;
   asserts `totalSessions == 1`.
4. Deletes the session; waits; asserts `totalSessions == 0`.
5. Invokes `deleteUserData`; asserts the response shape.

## Verifying the wire-up

Three layers of coverage:

- **`src/config/env.test.ts`** — JS env matches the iOS plist,
  the Android `google-services.json`, and `app.json`. Catches
  drift at CI.
- **`eas.json.test.ts`** — every build profile declares the
  6 `FIREBASE_*` vars + `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`.
  Catches "I forgot to add the var to the new profile" before it
  ships.
- **`scripts/smoke-firebase-emulator.sh`** — the runtime check.
  Boots the real emulator suite and exercises the function triggers.
  This is what catches "I deployed but forgot to wire the env".

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "permission-denied" on every Firestore read in prod | `firestore.rules` not deployed. Run `firebase deploy --only firestore:rules,storage` |
| Google Sign-in rejects with `10: Application misconfigured` | Bundle id in `app.json` doesn't match the OAuth client id in `google-services.json` / `GoogleService-Info.plist`. See P4.11 commit `a5744b4`. |
| Function deploy fails with "Module not found" | Run `pnpm --filter ./functions build` then re-run `firebase deploy --only functions` |
| `eas env:create` says "Variable not declared in profile" | The `env` block is missing from that profile. The `eas.json.test.ts` regression guard catches this. |

## Cross-references

- Cloud Function source: `functions/src/index.ts`
- Cloud Function tests: `functions/src/logic.test.ts`
- JS env: `src/config/env.ts`
- JS env test: `src/config/env.test.ts`
- Emulator rules: `firestore.rules`, `storage.rules`
- Native configs: `android/app/google-services.json`, `ios/MyPen/GoogleService-Info.plist` (gitignored)
