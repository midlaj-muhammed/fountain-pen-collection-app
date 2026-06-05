# P4.6 — Store release

## App Store (iOS)

1. `eas build --profile production --platform ios` (release AAB
   equivalent — IPA)
2. In App Store Connect → MyApp → App Store:
   - Promote the build to the "1.0" release
   - Fill in the metadata: name, subtitle, description, keywords,
     category (Productivity), privacy URL
   - Upload screenshots: 6.5" (iPhone 14) and 5.5" (iPhone 8 Plus)
     in **light** and **dark** themes — 3 each, minimum
   - Add the app icon (1024×1024 PNG, no alpha)
   - Pricing: Free (with the in-app purchase tier planned for v1.x)
   - Submit for App Review
3. Expected review time: 24–48h. Plan for a 1-week buffer.

## Play Store (Android)

1. `eas build --profile production --platform android` (AAB)
2. In Google Play Console → MyPen → Production:
   - Create a new release with the AAB
   - Fill in the store listing: name, short description, full
     description, screenshots (phone + tablet, light + dark)
   - Add the feature graphic (1024×500)
   - Privacy policy URL (required for any app using `dangerous` permissions)
   - Content rating questionnaire (IARC)
   - Target audience + category
   - Submit for review
3. Expected review time: hours to a few days.

## Required artefacts

- **Privacy policy** — host at `https://mypen.app/privacy`. Must cover
  Firebase data collection, push notifications, and analytics.
- **Support URL** — `https://mypen.app/support` or a Zendesk/help
  center.
- **Marketing site** — minimal landing page at `mypen.app` describing
  the app, with App Store + Play badges.
- **EULA** — falls back to Apple's Standard EULA + Google's default
  unless we ship a custom one.

## App metadata templates

### Name
> MyPen — Fountain Pen Collection & Session Log

### Subtitle
> Pens, Inks, Sessions

### Short description (Play, 80 chars)
> Catalog your pens and inks. Log every writing session.

### Full description (App Store, ≤ 4000 chars)
> MyPen is the home for fountain-pen hobbyists. Keep a beautiful
> record of every pen and ink you own, log writing sessions from a
> calendar, track ink levels, and watch your collection grow over
> time.
>
> Features
> • Catalog pens with brand, model, nib, color, and optional photo
> • Track inks (bottles + cartridges) with a 5-dot fill level
> • Log writing sessions from the calendar — pen, ink, duration,
>   rating, notes
> • Record nib swaps and see the history of every pen
> • Stats: total sessions, current streak, top pens, top inks,
>   monthly bar chart
> • Works offline; writes queue and sync when you reconnect
> • Dark mode + light mode; respects system font scale
>
> MyPen does not show ads, sell your data, or require an account
> beyond email + Google sign-in.

## Release-day runbook

1. Cut a release branch (`release/1.0.0`) and tag the commit
2. `eas build --profile production --platform ios` and `... android`
3. Promote the iOS build to App Store via `eas submit --platform ios`
4. Promote the Android AAB to Play via `eas submit --platform android`
5. Tag `v1.0.0` on `main`
6. Announce on the marketing site and any pre-launch email list
7. Monitor Crashlytics + Sentry for the first 48h

## Post-release

- Triage incoming bug reports daily for the first 2 weeks
- Cut `1.0.1` / `1.0.2` as hot-fix patches (semver `patch`)
- Plan the v1.1 milestone: avatar uploads, profile editing in the
  Cloud Function, push notifications, in-app purchase for "Pro" tier
