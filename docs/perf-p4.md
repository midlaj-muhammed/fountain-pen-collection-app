# P4.3 — Performance baseline

## Targets (per `tasks/plan.md`)

| Metric | Target | Notes |
| --- | --- | --- |
| Cold start (T_TTI to first paint of Pens tab) | < 1.5s | Mid-tier Android (Pixel 4a equivalent) |
| List scroll (Pens / Inks / Sessions / Stats) | 60fps | Sustained, not just first frame |
| Image upload | < 2s | 1MB JPEG → Firebase Storage |

## Current state (2026-06-05)

### Cold start
The app boots with these providers in order:
`ThemeProvider → QueryProvider → AuthProvider → NetInfoProvider → RootNavigator → ToastHost`.

`QueryProvider` is the slowest (constructs a `QueryClient` and
initialises Firestore offline persistence on mount). To shave time
later we can:
- lazy-load the AuthProvider until the splash decision is made
- defer `enableOfflinePersistence()` until after the first frame

### List scroll
`PenListScreen` is now backed by `@shopify/flash-list` (P4.3 change).
Inks, Sessions, Nib-swap, Stats and the rest of the lists still use
`ScrollView`. FlashList adoption backlog:

- `InkListScreen` (2-col grid is FlashList-friendly with `numColumns={2}`)
- `SessionList` (date-bucketed — single list with section headers in
  FlashList, or a `SectionList` is fine for < 100 sessions)
- `NibSwapHistory` (single column, expected to be small — low priority)
- `StatsScreen` (top 3 pens + top 3 inks are tiny — leave as ScrollView)

The form screens (`PenForm`, `InkForm`, `SessionForm`, `NibSwapForm`,
`ProfileScreen`, `SettingsScreen`, `DeleteAccountScreen`) are
ScrollView-wrapped because they show one column of fields. The scroll
target applies only to the data lists above.

### Image upload
The `photoURL` field on `Pen`, `Ink`, and `User` is `null` everywhere
in v1. The `expo-image-picker` is in the P0 dependency list but no
upload flow is wired yet. When added:
- compress to 1024px / 80% JPEG before upload
- upload to `users/{uid}/{kind}/{id}/photo.jpg`
- show a Skeleton placeholder while uploading
- target < 2s on a mid-tier device

### Idle / GC
React Query `gcTime` is 5 min; `staleTime` is 1 min. Combined with
`refetchOnReconnect: true` this is the right balance for a mobile
app where the source of truth is Firestore's onSnapshot.

## How to measure

### Cold start (Android)
1. `eas build --profile development --platform android`
2. Install on a Pixel 4a or equivalent
3. Cold start: `adb shell am force-stop com.mypen && adb shell am start -n com.mypen/.MainActivity`
4. Time until the first `home-greeting` testID is visible (Detox `toBeVisible` is a good signal)

### Scroll FPS
Detox:
```ts
await element(by.id('home-recent-pens')).scroll(200, 'down');
await element(by.id('home-recent-pens')).scroll(200, 'down');
```
Capture a Perfetto trace and check for `Choreographer#doFrame` skipped
frames. Target: 0 skipped frames in 5s of scrolling.

### Image upload (planned)
- mock a 1MB JPEG in a test
- `expect(uploadDuration).toBeLessThan(2000)`

## Decisions

- FlashList is adopted on `PenListScreen` first because collectors can
  easily have 50+ pens and ScrollView drops frames around 30 items.
- Form screens stay on ScrollView — they don't scroll fast enough for
  the 60fps target to be at risk, and FlashList inside a keyboard-
  avoiding-input form adds complexity for no measurable win.
- The Calendar design component uses `react-native-calendars`
  internally; the performance of the calendar grid is outside our
  control and the monthly grid is small enough that ScrollView-like
  virtualisation is unnecessary.
