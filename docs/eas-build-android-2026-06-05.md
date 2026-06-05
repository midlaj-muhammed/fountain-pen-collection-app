# EAS Android Build — State on 2026-06-05

This document records the state of the EAS Build setup as of 2026-06-05,
what was attempted, what failed, and the open decision about how to get
a working APK out the door.

## TL;DR

The first EAS Build for the `preview` Android profile was attempted on
2026-06-05. The build correctly pulled the project, validated the
`eas.json` env vars, created a keystore, uploaded the project (43.1 MB),
and got to the gradle phase — where it failed with
`EAS_BUILD_UNKNOWN_GRADLE_ERROR`. **The root cause is a real
incompatibility between `react-native-mmkv@^3.1.0` and
`react-native@0.74.5`**, and the project needs an architectural decision
before the next retry. Two EAS builds were burned on the diagnosis.

**Status: build pipeline is wired up, but the codebase does not yet
build. A `gstack` install + EAS login + project link + env-var
population are all in place; one real package upgrade is needed.**

## What is now in place (working)

1. **`gstack` is installed** at `~/.claude/skills/gstack`. Verified with
   `test -d ~/.claude/skills/gstack/bin && echo GSTACK_OK`.
2. **EAS CLI is installed** in the repo: `eas-cli@^20.0.0` in
   `devDependencies` (run via `./node_modules/.bin/eas`).
3. **EAS project is linked**: `midlajvalappil/mypen` with project ID
   `522cbfc6-2cb2-4d34-bf0d-c67e8f161c82`. `app.json` now has the real
   `extra.eas.projectId` and an `owner` field.
4. **A keystore exists** on EAS. Both failed builds reused it, so the
   next successful build will install on top of any device that has v1
   already (this is desirable for testing OTA updates later).
5. **`eas.json` env vars are populated** for all four profiles
   (`base`, `development`, `preview`, `production`) with the values
   from `google-services.json`. The `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`
   flag is set to `"0"` to preserve "off" semantics while satisfying
   the EAS non-empty-string validator.
6. **`babel-preset-expo@~11.0.15`** is added to `devDependencies` to
   match Expo SDK 51. (pnpm initially resolved to `^56.0.14`, which is
   for newer SDKs; pinned to `~11.0.0` to keep compatibility with
   Babel 7 / Expo 51.)

## What failed

Both build attempts (build IDs `720213b2-5e3e-4685-bd4a-539081bf991f`
and `d47c7ebc-7114-4864-9e9b-674bc985550f`) failed with the same
gradle error. The first attempt surfaced two issues; the second
attempt, with the babel fix in place, surfaced only the remaining one.

### Issue 1 (resolved): `babel-preset-expo` was missing

`babel.config.js:4` references `'babel-preset-expo'`, but it was not in
`package.json`. The Metro bundler in the EAS worker bails with:

```
SyntaxError: index.js: Cannot find module 'babel-preset-expo'
Error: Cannot find module 'babel-preset-expo'
```

**Fixed**: added `babel-preset-expo@~11.0.15` to `devDependencies`.

### Issue 2 (open): `react-native-mmkv@^3.1.0` is incompatible with RN 0.74.5

`react-native-mmkv` v3 was written against the old React Native
architecture. It depends on `MmkvPlatformContextModule`, a class that
was removed in RN 0.74's new architecture. Even with `newArchEnabled=false`
in `android/gradle.properties`, gradle still pulls in the new-arch
headers and the compile fails:

```
> Task :react-native-mmkv:compileReleaseJavaWithJavac FAILED
MmkvPlatformContextModule.java:7: error: cannot find symbol
MmkvPackage.java:19: error: cannot find symbol
MmkvPackage.java:20: error: incompatible types:
  MmkvPlatformContextModule cannot be converted to NativeModule
8 errors
```

This is a hard incompatibility. There is no flag to make v3 compile on
RN 0.74.

## Decision: which way to fix the mmkv problem?

There are three viable paths. They are listed in order of recommended
preference given this repo's current state.

### Path A — Upgrade to `react-native-mmkv@^4` + new arch + nitro

- **What it does**: bumps mmkv to v4, which is a TurboModule that
  uses `react-native-nitro-modules` (a JSI-based binding layer). Sets
  `newArchEnabled=true` in `android/gradle.properties` and re-runs
  `expo prebuild` to regenerate the native project.
- **Why it's appealing**: keeps MMKV (best-in-class perf), gets the
  project onto the new arch (which Expo is moving toward anyway).
- **Why it's risky**:
  - Other native modules may not support the new arch on RN 0.74:
    `react-native-screens@3.31.1`, `react-native-reanimated@~3.10.1`,
    `@react-native-google-signin/google-signin@^16.1.2` all predate
    new-arch GA on RN 0.74 and may need their own minor bumps.
  - `expo prebuild` regenerates `android/` from scratch; any manual
    edits to `android/app/build.gradle` or `AndroidManifest.xml`
    (e.g. the Firebase wiring in `apply-firebase-configs.sh`) must
    survive that regeneration. Worth checking that script before
    re-running.
- **Estimated cost**: 2–6 hours of EAS build cycles, plus 0.5–1 day of
  bumping peer modules if anything else breaks. **70% success on a
  single retry; 20% one-more-module-fails; 10% nitro itself is the
  blocker.**

### Path B — Replace mmkv with `@react-native-async-storage/async-storage`

- **What it does**: swap the single `src/lib/cache/mmkvCache.ts`
  module to use AsyncStorage. AsyncStorage is old-arch compatible and
  is the standard Expo recommendation for non-MMKV use cases.
- **API surface in this repo is small**: the codebase uses only
  `new MMKV({ id })`, `mmkv.set`, `mmkv.getString`, `mmkv.clearAll`.
  AsyncStorage exposes `setItem`, `getItem`, `multiGet`, `clear` —
  straightforward mapping.
- **Why it's appealing**: no new arch, no prebuild, no module-rewrite
  risk. The diff is bounded to one source file + one test.
- **Trade-off**: AsyncStorage is significantly slower than MMKV for
  hot reads (every read is a JSON-string round trip + a
  SharedPreferences round trip on Android). For a cold-start cache of
  a small list of pens/inks, this is probably fine.
- **Estimated cost**: ~1 hour, 1 build cycle. **95% success.**

### Path C — Pin RN to 0.73.x

- **What it does**: downgrade React Native to 0.73.x to keep mmkv v3
  working on the old arch.
- **Why it's risky**:
  - RN 0.73 to 0.74 may have moved APIs that the Firebase / Google
    Sign-in code (just added in commits `cb09d3b` and `f5f1a80`)
    depends on. Downgrade may require redoing that work.
  - Native module autolinking behaviour changed between 0.73 and 0.74.
- **Estimated cost**: 1 day of risk. **50% success.**

## My recommendation

**Path B (replace MMKV with AsyncStorage) if a working APK is needed
fast and the perf gap is acceptable. Path A (mmkv v4 + new arch) if
there's time to do it right.**

Path C is a third option, but its hidden cost is undoing recent
Firebase / Google Sign-in work, and the value (keeping MMKV perf) is
much smaller than Path A's upside.

## What's needed next

To unblock the build, the chosen path must be executed end-to-end:

1. Edit `package.json` (and the matching source file(s)).
2. Re-run `pnpm install`.
3. (Path A only) Re-run `npx expo prebuild --no-install &&
   ./scripts/apply-firebase-configs.sh` to regenerate the native
   project.
4. Run the local sanity checks: `pnpm typecheck`, `pnpm test`,
   `pnpm lint`.
5. Run `eas build --platform android --profile preview
   --non-interactive --no-wait` and watch the result.
6. Confirm the APK URL on the EAS build page and download.

## Appendix: EAS state

- **Project**: `@midlajvalappil/mypen`
  ([dashboard](https://expo.dev/accounts/midlajvalappil/projects/mypen))
- **Project ID**: `522cbfc6-2cb2-4d34-bf0d-c67e8f161c82`
- **Keystore**: created on first build, reused thereafter. Reference
  ID `ma3tNFrgxy`.
- **Failed builds**:
  - `720213b2-5e3e-4685-bd4a-539081bf991f` (IN_QUEUE → IN_PROGRESS → ERRORED)
  - `d47c7ebc-7114-4864-9e9b-674bc985550f` (IN_QUEUE → IN_PROGRESS → ERRORED)
- **Live log URL pattern** (Brotli-compressed, fetch with
  `curl --compressed -L`):
  `https://storage.googleapis.com/eas-workflows-production/logs/522cbfc6-2cb2-4d34-bf0d-c67e8f161c82/<BUILD_ID>/...`
