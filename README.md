# MyPen

> A fountain pen collection & usage tracker — iOS + Android, built with Expo + Firebase.

## Status
Pre-build. See [`PRD.md`](./PRD.md), [`SPEC.md`](./SPEC.md), and [`tasks/plan.md`](./tasks/plan.md).

## Stack
- **Mobile:** React Native (Expo, managed) + TypeScript (strict)
- **State:** Zustand + TanStack Query
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Local:** Firestore offline persistence + MMKV mirror
- **Navigation:** React Navigation v6
- **Lists:** FlashList
- **Calendar:** react-native-calendars
- **Notifications:** expo-notifications (local)

## Quick start
```bash
# Install pnpm (one-time)
corepack enable
corepack prepare pnpm@latest --activate

# Install deps
pnpm install

# Start dev
pnpm start

# iOS / Android
pnpm ios
pnpm android
```

## Layout
```
src/
  app/         # App entry, providers, root navigation
  design/      # Design system (tokens + Figma-named components)
  features/    # Feature modules (auth, pens, inks, calendar, ...)
  lib/         # Generic utilities (firebase, mmkv, notifications, ...)
  store/       # Zustand stores
  types/       # Shared TypeScript types
  config/      # Env + constants
functions/     # Firebase Cloud Functions
e2e/           # Detox E2E tests
```

## Scripts
See `SPEC.md §2` for the full list of commands.

## Design
Design source of truth: `figma-screens/` (42 frames).
Tokens and component names are aligned with that folder — see `SPEC.md §6`.
