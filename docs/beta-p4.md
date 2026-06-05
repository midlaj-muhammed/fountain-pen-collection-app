# P4.5 — Beta release checklist

## Goals

- Validate the app on real devices with real accounts for 7+ days
- Hit **0 P0/P1 bugs** and **< 0.5% crash rate** before promoting
  to the store release
- Get a 3-person dogfood signal: at least 3 distinct accounts
  completing the full flow (add pen + ink → log session → view stats)

## TestFlight (iOS)

1. `eas build --profile preview --platform ios` (internal distribution)
2. In App Store Connect → MyApp → TestFlight:
   - Add the build to a "Beta" group
   - Add internal testers by email (no App Review needed for up to
     100 internal testers)
3. Distribute the TestFlight link to internal testers via email

## Internal Play track (Android)

1. `eas build --profile preview --platform android` (APK / AAB)
2. In Google Play Console → MyPen → Testing → Internal testing:
   - Create a new release with the AAB
   - Add internal testers by email
3. Distribute the opt-in URL

## Observability

- **Crashlytics** (Firebase Crashlytics) — auto-installed via the
  `@react-native-firebase/crashlytics` package (to be added when
  EAS config requires it). Confirm crashes are reported on every
  cold start.
- **Sentry** — optional. If added, point to a `sentry-expo` config in
  `app.json` and set `SENTRY_DSN` in EAS env.

## Acceptance criteria

| Metric | Target | How to check |
| --- | --- | --- |
| P0/P1 bugs | 0 | Manual triage of GitHub issues labelled `bug` and `severity/p0` or `severity/p1` |
| Crash rate | < 0.5% | Crashlytics dashboard |
| DAU/WAU | ≥ 30% of test installs | TestFlight + Play internal dashboards |
| Cold start | < 1.5s (mid-tier Android) | Manual + Detox `e2e/perf.e2e.ts` |
| Quick-log 1-tap | works on every session | `e2e/quick-log.e2e.ts` green |

## Devices to dogfood on

Minimum 3 distinct devices, mix of OS:

- iOS 17 (iPhone 14 or newer) — covers Dynamic Type, SafeArea
- iOS 16 (iPhone 12) — covers a slightly older baseline
- Android 14 (Pixel 6 or 7) — covers Material You + edge-to-edge
- Android 12 (Samsung A-series mid-tier) — covers a slower device for
  perf checks

## Pre-flight checklist

- [ ] All P4.1–P4.4 acceptance criteria met
- [ ] `pnpm typecheck && pnpm lint && pnpm test` green on `main`
- [ ] `eas build --profile preview --platform ios` succeeds
- [ ] `eas build --profile preview --platform android` succeeds
- [ ] `e2e/auth.e2e.ts` + `e2e/pens.e2e.ts` + `e2e/quick-log.e2e.ts`
      green in CI
- [ ] Crashlytics test event visible in dashboard
- [ ] Privacy policy + support URL live on the marketing site
- [ ] App Store / Play metadata screenshots staged (3 locales: en-US,
      en-GB, en-AU minimum)

## When to promote to P4.6

After 7 consecutive days with:
- crash rate < 0.5%
- 0 open P0/P1 bugs
- at least 3 dogfood users reporting no blockers
