# MyPen — Implementation Plan

> **Version:** 1.0 (2026-06-04)
> **Status:** Awaiting human review
> **Companions:** `PRD.md`, `SPEC.md`
> **Vertical-slice plan:** each task ships a complete, demoable path through one feature.

---

## 0. How to read this plan

- **Phases** are the high-level stages (numbered P0–P4).
- **Slices** are vertical tasks within a phase — each one is a complete feature, end-to-end.
- **Checkpoints** are gates between phases that the human reviews before continuing.
- Every task has **Acceptance criteria** and a **Verify** command(s) you can run.

Slicing is **vertical, not horizontal**. We never spend a week on "set up every screen's UI" or "wire up every API" — instead, each task carries one feature all the way from tap → data → state → UI so it is **independently demoable and testable**.

---

## 1. Dependency Graph

```
                            ┌─────────────────────────────┐
                            │   P0 — Foundation            │
                            │   - Expo + TS + Firebase     │
                            │   - CI, lint, typecheck      │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │   P1 — Design System         │
                            │   - Tokens (375/15/345)       │
                            │   - Figma-named components   │
                            │   - Storybook + a11y         │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │   P2 — Auth                  │
                            │   - Email + Google           │
                            │   - Welcome → Signup → Home  │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
   ┌──────────────────┐  ┌──────────────────────────┐  ┌────────────────────┐
   │ S1: Pens CRUD    │  │ S2: Inks CRUD            │  │ S3: Home dashboard │
   │   (parallel)     │  │   (parallel)             │  │   (parallel)       │
   └────────┬─────────┘  └────────────┬─────────────┘  └─────────┬──────────┘
            │                          │                          │
            └──────────┬───────────────┴──────────────────────────┘
                       ▼
            ┌──────────────────────────────────┐
            │ S4: Sessions + Quick Log          │
            └──────────────┬────────────────────┘
                           ▼
            ┌──────────────────────────────────┐
            │ S5: Nib swaps + Pen history      │
            └──────────────┬────────────────────┘
                           ▼
            ┌──────────────────────────────────┐
            │ S6: Stats (analytics + calendar) │
            └──────────────┬────────────────────┘
                           ▼
            ┌──────────────────────────────────┐
            │ S7: Settings + Reminders + Profile│
            └──────────────┬────────────────────┘
                           ▼
            ┌──────────────────────────────────┐
            │ S8: Offline + Sync + Polish       │
            └──────────────┬────────────────────┘
                           ▼
                            ┌─────────────────────────────┐
                            │   P4 — Testing & Release     │
                            │   - Unit + E2E + perf + β    │
                            └─────────────────────────────┘
```

**Key dependency notes**
- S1, S2, S3 can run in parallel after P2 — different features, no data dependency.
- S4 (Sessions) depends on S1 + S2 (a session needs a pen and an ink to exist).
- S5 (Nib swaps) depends on S1 (needs pens).
- S6 (Stats) depends on S1 + S2 + S4 (consumes their data).
- S7 (Settings) is mostly standalone.
- S8 (Offline) is a cross-cutting concern applied to all features.

---

## 2. Phase 0 — Foundation (Week 1)

**Goal:** A blank Expo app that boots with brand splash, has Firebase wired, and passes CI on every PR.

### Task P0.1 — Bootstrap Expo + TypeScript
- Init Expo (managed, blank TS template)
- Configure `tsconfig.json` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, path alias `@/*` → `src/*`)
- Install: `react-navigation`, `zustand`, `@tanstack/react-query`, `expo-image-picker`, `expo-notifications`, `@react-native-community/netinfo`, `react-native-mmkv`, `react-hook-form`, `zod`, `lucide-react-native`, `react-native-reanimated`, `react-native-gesture-handler`, `@shopify/flash-list`, `react-native-calendars`, `date-fns`, `@10play/tentap-editor` *(not needed for v1 — pen tracker uses forms, not rich text; remove if confirmed)*
- Configure Babel for Reanimated
- **Acceptance:** `pnpm ios` and `pnpm android` boot a blank screen with the MyPen splash.
- **Verify:** `pnpm start` → `pnpm ios` shows splash; `pnpm typecheck` exits 0.

### Task P0.2 — Lint, format, git hooks
- ESLint config: `@typescript-eslint`, `react`, `react-hooks`, `react-native`, `import`, `jsx-a11y`
- Prettier (2 spaces, single quotes, 100 cols)
- Husky + lint-staged
- `.editorconfig`, `.gitignore` (incl. `.env*`, `node_modules`, `ios/`, `android/` for managed)
- **Acceptance:** Staged edits auto-format; PR with bad formatting fails locally.
- **Verify:** `pnpm lint && pnpm format --check && ppm typecheck` all exit 0 on `main`.

### Task P0.3 — Folder skeleton + base providers
- Create folders from SPEC §3 (empty index files where useful)
- Implement providers in `src/app/providers/`: `ThemeProvider`, `QueryProvider`, `NetInfoProvider`, `AuthProvider` (stub)
- Wire `App.tsx` to mount providers + `RootNavigator` (stub `<SplashScreen />`)
- **Acceptance:** App boots, shows a placeholder screen wrapped in all providers.
- **Verify:** `pnpm ios` shows placeholder; hot reload works on provider changes.

### Task P0.4 — Firebase project + client wiring
- Create Firebase project (dev + prod)
- Register iOS + Android apps in Firebase console
- Install `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-firebase/storage`, `@react-native-firebase/functions`
- `google-services.json` + `GoogleService-Info.plist` in repo (or in EAS env for prod)
- Implement `src/lib/firebase/{client,auth,firestore,storage,functions}.ts`
- **Acceptance:** App connects to Firebase, `firebase.auth().currentUser` is `null` on launch (no auth).
- **Verify:** `console.log(firebase.apps.length)` in dev client shows 1; no crash on launch.

### Task P0.5 — CI + EAS
- GitHub Actions: `.github/workflows/ci.yml` runs `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test --bail` on every PR
- `eas.json` with `development`, `preview`, `production` profiles
- **Acceptance:** PR fails CI if lint/typecheck/tests fail; `eas build --profile development --platform ios` succeeds.
- **Verify:** Open a deliberately broken PR; CI goes red; revert; CI goes green.

### **Checkpoint P0** — Human reviews
- [ ] App boots on both platforms
- [ ] Firebase wired (no auth yet, just connection)
- [ ] CI green
- [ ] Folder structure matches SPEC §3

---

## 3. Phase 1 — Design System (Weeks 2–3)

**Goal:** Every Figma-named component is implemented, themed, and demonstrable in Storybook.

### Task P1.1 — Tokens
- Implement `src/design/tokens/{colors,typography,spacing,radius,layout,motion}.ts` per SPEC §6
- `src/design/theme/{light,dark,useTheme}.ts` with `ThemeProvider`
- **Acceptance:** Switching `<ThemeProvider value="dark">` re-tokens the whole app.
- **Verify:** Mount a button with both themes; visual diff matches SPEC.

### Task P1.2 — Primitives
- `Box`, `Stack`, `Text`, `Pressable` (typed, themed, a11y-forward)
- **Acceptance:** All primitives accept `style` overrides that compose with tokens; screen reader labels pass.
- **Verify:** Render `<Stack gap="md">` with three texts; RNTL snapshot of rendered tree.

### Task P1.3 — Figma-named components
Build the following in parallel, each as its own sub-task with stories:
- `ButtonS` (primary, secondary, ghost; sm/md/lg)
- `TabS` (bottom tab bar, used later in P2)
- `SectionHeader` (h2 + optional "See all" right slot)
- `Rating` (1–5, read-only and interactive)
- `Calendar` (monthly grid + heatmap variant)
- `Filters` (bottom sheet, multi-section)
- `PenListItem` (per Figma spec: photo 64×64, brand/model/nib chip, usage + chevron)
- `InkListItem` (swatch 56×80, brand/name/level bar, ml + chevron)
- `InkLevelBar` (horizontal 0–100%, color = ink swatch, low/ok/full labels)
- `QuickLog` (sticky bottom card, pen + ink pre-fill, 1-tap confirm)
- `EmptyState`, `Avatar`, `Chip`, `FAB`, `Toast`, `Skeleton`, `Modal`/`Sheet`
- **Acceptance per component:** Storybook stories for default, hover (web), pressed, disabled, error, dark mode; ≥ 60% line coverage; a11y labels.
- **Verify:** `pnpm storybook` (or equivalent) shows every state. Run RNTL tests: `pnpm test design/components`.

### Task P1.4 — Accessibility audit
- Run `axe-react-native` or manual VoiceOver/TalkBack pass
- Hit targets ≥ 44pt, contrast ≥ 4.5:1, dynamic type supported
- **Acceptance:** A11y checklist passes for every component.
- **Verify:** Document results in `docs/a11y-p1.md`; mark each component ✅/❌ with notes.

### **Checkpoint P1** — Human reviews Storybook
- [ ] Tokens match Figma (375/15/345)
- [ ] All Figma-named components exist
- [ ] Light + dark both pass
- [ ] A11y audit green

---

## 4. Phase 2 — Authentication (Week 4)

**Goal:** New user can sign up, verify, and land on Home. Returning user silent-login < 1.5s.

### Task P2.1 — Auth context + Firebase wrappers
- `src/lib/firebase/auth.ts` with typed wrappers: `signUpWithEmail`, `signInWithEmail`, `signInWithGoogle`, `sendPasswordReset`, `signOut`, `onAuthStateChanged`
- `src/store/authStore.ts` (Zustand): `user`, `status: 'loading' | 'signedIn' | 'signedOut'`
- `src/app/providers/AuthProvider.tsx` wires `onAuthStateChanged` → store
- **Acceptance:** `useAuth()` returns `{ user, status, signIn, signUp, signOut }` with full typing.
- **Verify:** Unit test for `authStore`; integration test with Firebase Auth emulator.

### Task P2.2 — Welcome + Sign Up + Sign In + Forgot screens
- Build all 4 screens in `src/features/auth/screens/`
- React Hook Form + Zod for validation
- "Sign in with Google" button uses native Google sign-in
- `useToast()` for errors
- **Acceptance:** Sign up with a test email → verification email received → user redirected to Home (after verification, if gated).
- **Verify:** Detox spec: `auth.spec.ts` — sign up → check email gate → land on Home.

### Task P2.3 — Route guards + profile creation
- `RootNavigator` checks `authStore.status`; renders `AuthStack` or `MainTabs`
- `onUserCreate` Cloud Function provisions `users/{uid}` doc
- `MainTabs` renders the 4 tabs (Pens / Inks / Log / Stats) with empty states
- **Acceptance:** New user reaches `MainTabs` after signup; existing user silent-login < 1.5s.
- **Verify:** Cold start with cached token → tab bar visible in < 1.5s (measure with `performance.now()` in dev build).

### **Checkpoint P2** — Human reviews auth flow
- [ ] Email + Google sign-in work end-to-end
- [ ] Route guards work
- [ ] Profile doc created
- [ ] Cold-start < 1.5s

---

## 5. Phase 3 — Core Features (Weeks 5–7)

> **Slicing rule:** each slice (S1–S8) is a complete vertical path. A slice is done only when: UI exists + data layer works + happy path is testable + empty state exists.

### Slice S1 — Pens CRUD (parallel with S2, S3)

#### Task S1.1 — Pen data layer
- `src/features/pens/types.ts`: `Pen`, `NibSize`, `NibMaterial` matching PRD §7.3
- `src/features/pens/api/{pens.ts,queries.ts}`: TanStack Query hooks for list, get, create, update, delete
- Zod schema for `PenForm`
- `src/lib/firebase/firestore.ts` helpers: typed collection refs
- **Acceptance:** `usePens()` returns `Pen[]` from Firestore; `useCreatePen()` writes and invalidates.
- **Verify:** Unit test on a `pensApi` wrapper with emulator.

#### Task S1.2 — Add/Edit Pen form
- `src/features/pens/screens/PenForm.tsx` (handles both new + edit)
- Fields: brand, model, nib size (chip select), nib material (chip select), color (color picker), photo (image picker → upload), acquiredAt (date), notes
- Submit → `useCreatePen` or `useUpdatePen` → toast → back
- **Acceptance:** From FAB on Pens tab → fill form → save → new pen appears in list.
- **Verify:** Detox spec: `pens-crud.spec.ts`.

#### Task S1.3 — Pen list + detail
- `src/features/pens/screens/PenList.tsx`: FlashList of `PenListItem` (uses design system component), grouped: pinned → by updatedAt
- `src/features/pens/screens/PenDetail.tsx`: photo header, fields, sessions count, edit/delete actions
- Empty state for new users
- **Acceptance:** Tapping a pen navigates to detail; edit and delete work; empty state shows for new users.
- **Verify:** Detox spec: list → tap → detail → edit → save → detail updated.

#### Task S1.4 — Soft-delete + restore hook
- `useDeletePen` sets `deletedAt`; doc still readable via `trash: true` flag on hook
- Cloud Function `purgeTrash` is stubbed (real impl in P4)
- **Acceptance:** Deleted pens disappear from active list; can be queried separately.
- **Verify:** Unit test: `useDeletePen` sets `deletedAt` to a Timestamp.

**Slice S1 done when:** User can add, view, edit, and soft-delete pens. Empty state shown for new users. Detox spec green.

---

### Slice S2 — Inks CRUD (parallel with S1, S3)

Mirrors S1 exactly, with the addition of:
- **Ink level bar** in the form (slider 0–100%, default 100)
- **Ink level bar** rendered in `InkListItem` and `InkDetail`
- "Mark empty" / "Refill" quick actions on detail

**Tasks:** S2.1 data layer → S2.2 InkForm → S2.3 list + detail → S2.4 soft-delete.
**Acceptance:** Same shape as S1, plus the level bar updates `currentLevelPct` correctly.
**Verify:** Detox: `inks-crud.spec.ts` — add ink → set level to 30% → list shows low badge.

---

### Slice S3 — Home dashboard (parallel with S1, S2)

#### Task S3.1 — Home screen
- `src/features/home/screens/HomeScreen.tsx`
- Sections (using `SectionHeader`): "Today" (sessions count), "Quick Log" sticky card, "Recent pens", "Recent inks", "Ink low" alert
- Pull-to-refresh
- **Acceptance:** Home renders for an empty user (empty states everywhere) and for a user with data.
- **Verify:** Manual + Detox: with seeded data, Home shows correct counts.

#### Task S3.2 — Quick Log (1-tap path)
- `QuickLog` card pre-fills last-used pen + ink
- One tap → creates a session with current date, 15 min, 0 rating, blank notes
- Toast: "Logged ✓ — tap to edit"
- **Acceptance:** 1-tap log works; tapping the toast opens SessionDetail.
- **Verify:** Detox spec: `quick-log.spec.ts` — first create pen + ink → Home → 1 tap → list shows new session.

**Slice S3 done when:** Home dashboard renders; 1-tap log creates a session end-to-end.

---

### Slice S4 — Sessions

Depends on S1 + S2 (sessions reference pens and inks).

#### Task S4.1 — Session data layer
- `src/features/sessions/types.ts`, `api/sessions.ts`, `useSessions` (date-desc), `useCreateSession`, `useUpdateSession`, `useDeleteSession`
- Cloud Function `onSessionWrite` increments `pen.totalSessions` and `ink.totalSessions`, updates `ink.lastUsedAt`
- **Acceptance:** Creating a session updates pen/ink counters; deleting decrements.
- **Verify:** Emulator test for `onSessionWrite`.

#### Task S4.2 — Session form
- `src/features/sessions/screens/SessionForm.tsx`
- Fields: date (default now), pen (select), ink (select — filtered to inks if a pen has `currentInkId` set), duration (number input, min 1), rating (1–5), notes
- **Acceptance:** Save → appears in list with correct pen + ink labels.
- **Verify:** Detox: `sessions.spec.ts` — log a session → list shows it → tap → detail shows correct data.

#### Task S4.3 — Sessions list (date-grouped)
- `src/features/sessions/screens/SessionList.tsx`
- FlashList with section headers by day (Today, Yesterday, This week, Older)
- Empty state with "Log your first session" CTA
- **Acceptance:** List renders, scrolls smoothly at 500+ items (test with seeded data).
- **Verify:** Perf test: `pnpm test:e2e -- --testNamePattern="scrolls at 500 sessions"`.

**Slice S4 done when:** Sessions CRUD works, list renders, counters update.

---

### Slice S5 — Nib swaps + Pen history

Depends on S1.

#### Task S5.1 — Nib data layer
- `src/features/nibs/types.ts`, `api/nibs.ts`, `useNibSwaps(penId)`, `useCreateNibSwap`
- **Acceptance:** Swaps are per-pen; history is queryable.
- **Verify:** Unit tests on hooks.

#### Task S5.2 — Nib swap form + history
- `src/features/nibs/screens/NibSwapForm.tsx` on `pens/:id/nibs`
- Pre-fills "from" nib from pen's current nib
- Save → back to list
- **Acceptance:** Swap history is shown on Pen Detail (Nibs section); new swap adds a row.
- **Verify:** Detox: add pen → add swap → verify in pen detail.

**Slice S5 done when:** Users can log nib swaps and see history per pen.

---

### Slice S6 — Stats

Depends on S1 + S2 + S4.

#### Task S6.1 — Stats data layer
- `useStats({ dateRange, penIds, inkIds, rating })` aggregates sessions
- Cloud Function `monthlyStats` (called from client + scheduled) pre-aggregates `users/{uid}/stats/{YYYY-MM}`
- **Acceptance:** `useStats` returns counts, top pens, top inks, daily breakdown for any range.
- **Verify:** Unit test on aggregation with seed data.

#### Task S6.2 — Stats screen
- `src/features/stats/screens/StatsScreen.tsx`
- Sections: This month (sessions, words-est., minutes), Top 3 pens, Top 3 inks, Daily streak, Ink level alerts, Calendar heatmap
- **Acceptance:** Renders correctly for new (empty) users and active users.
- **Verify:** Detox: `stats.spec.ts` — with seeded data, all sections render.

#### Task S6.3 — Filters
- `Filters` bottom sheet (re-uses design system component) — date range, pens, inks, rating
- **Acceptance:** Applying filters re-renders Stats; URL/state syncs so back-nav preserves filters.
- **Verify:** Detox: open Filters → select pen → Stats updates.

**Slice S6 done when:** Stats renders, filters work, calendar heatmap visible.

---

### Slice S7 — Settings + Reminders + Profile

#### Task S7.1 — Profile screen
- View/edit name, avatar (upload to Storage), email (read-only), plan (read-only)
- **Acceptance:** Editing name updates everywhere; avatar upload shows progress.
- **Verify:** Detox: edit name → check Home shows new greeting.

#### Task S7.2 — Settings screen
- Theme (system/light/dark), font size, daily reminder toggle + hour picker, reorder alert toggle, sign out, delete account, version
- **Acceptance:** Every setting persists to `users/{uid}.settings` and applies app-wide.
- **Verify:** Detox: toggle dark mode → app re-themes; sign out → returns to Welcome.

#### Task S7.3 — Notifications
- `src/lib/notifications/{index,schedule,permissions}.ts`
- Daily reminder at user's hour, only if no session logged today (re-scheduled on each session)
- Reorder alert when ink level crosses 20% AND `lastUsedAt` < now - 14d
- **Acceptance:** Daily reminder fires in dev client at configured time; reorder alert appears on Home.
- **Verify:** Manual: schedule for +1 min → fires. Detox: enable → check permission grant flow.

#### Task S7.4 — Delete account
- Cloud Function `deleteUserData` cascade-deletes `users/{uid}/**`, Storage files, Auth user
- UI: confirm modal → "Type DELETE" → call function
- **Acceptance:** Calling delete removes all user data; UI returns to Welcome.
- **Verify:** Detox: delete account test account → verify no docs remain.

**Slice S7 done when:** All settings work, notifications fire, account deletion cascade works.

---

### Slice S8 — Offline + Sync + Polish

Cross-cutting; applied to S1–S7 where missing.

#### Task S8.1 — Firestore offline persistence
- Enable persistence in `src/lib/firebase/firestore.ts`
- **Acceptance:** Reads work offline; writes queue and flush on reconnect.
- **Verify:** Manual: airplane mode → list pens → visible; add pen → reconnect → appears on other device.

#### Task S8.2 — MMKV cold-start mirror
- Mirror pens/inks/sessions in MMKV on read; cold start renders from MMKV, then revalidates from Firestore
- **Acceptance:** Cold start with 200+ items renders list in < 500ms from local.
- **Verify:** Perf test: `pnpm test -- --testNamePattern="cold start"`.

#### Task S8.3 — Network banner
- `NetInfoProvider` exposes `isOnline`; top banner shows when offline
- **Acceptance:** Banner shows/hides correctly.
- **Verify:** Detox: toggle wifi off → banner appears; on → disappears.

#### Task S8.4 — Error toasts + retry
- All API calls surface errors via `<Toast>`; failed writes retry with exponential backoff
- **Acceptance:** Simulated network failure → toast → retry → success.
- **Verify:** Unit test: `withRetry` doubles delay up to 3 attempts.

**Slice S8 done when:** Offline writes sync, cold start < 1.5s, network banner works, retry works.

---

### **Checkpoint P3** — Human reviews full app
- [ ] All slices S1–S8 demoable
- [ ] Offline + sync green
- [ ] Cold start < 1.5s
- [ ] Daily reminder + reorder alert working
- [ ] No P0/P1 bugs

---

## 6. Phase 4 — Testing & Release (Weeks 8–10)

### Task P4.1 — Unit + component test coverage
- Push coverage to targets: 80% lib, 70% hooks, 60% components, 60% overall
- **Acceptance:** Coverage gates pass in CI.
- **Verify:** `pnpm test -- --coverage` and check thresholds.

### Task P4.2 — Detox E2E pass
- Run all 7+ Detox specs in CI on a simulator
- **Acceptance:** All green; new specs added for any regressions.
- **Verify:** `pnpm test:e2e` in CI.

### Task P4.3 — Performance
- Profile cold start (target < 1.5s), list scroll (target 60fps), image upload time
- Optimize: lazy-load editor toolbar, image compression, FlashList everywhere
- **Acceptance:** Targets met on a mid-tier Android device.
- **Verify:** Document in `docs/perf-p4.md` with measurements.

### Task P4.4 — A11y final pass
- VoiceOver / TalkBack walkthroughs of all flows
- **Acceptance:** All flows usable screen-reader-only.
- **Verify:** `docs/a11y-p4.md` checklist.

### Task P4.5 — Beta release
- TestFlight (iOS) + internal Play track (Android)
- Crashlytics + Sentry dashboards green for 7 days
- **Acceptance:** 0 P0/P1 bugs, < 0.5% crash rate.
- **Verify:** Manual install on 3+ test devices.

### Task P4.6 — Store release
- App metadata, screenshots (light + dark), privacy policy
- EAS `production` build
- Submit to App Store + Play Store
- **Acceptance:** Apps approved and live.
- **Verify:** Both stores show MyPen in production.

---

## 7. Effort Summary

| Phase | Slices | Estimated | Parallelizable? |
|---|---|---|---|
| P0 Foundation | P0.1–P0.5 | 1 wk | Mostly serial |
| P1 Design System | P1.1–P1.4 | 2 wks | Components parallel |
| P2 Auth | P2.1–P2.3 | 1 wk | Serial |
| P3 Core Features | S1–S8 | 3 wks | S1, S2, S3 parallel; rest serial by dep |
| P4 Testing & Release | P4.1–P4.6 | 3 wks | Tests parallel; release serial |
| **Total** | | **~10 wks** | |

---

## 8. Risks & Mitigations (revisit weekly)

| Risk | Mitigation |
|---|---|
| Figma tokens need rework after design review | P1 checkpoint catches this; P1.1–P1.3 are cheap to redo |
| TanStack Query + Firestore real-time pairing is awkward | Adopt `useQuery` for caches; bind Firestore `onSnapshot` only for active editing screens |
| Notifications reliability on Android 13+ | Use `expo-notifications` with explicit channel setup; test on real device |
| Cloud Function cold start | Stay on Node 20, min deps; consider scheduled warmup only if measured needed |
| Offline photo uploads lose data on crash | Persist upload queue in MMKV before upload starts |

---

## 9. What to approve

Approve the plan if you're good with:
1. **Phase order** (Foundation → DS → Auth → Core → Test/Release)
2. **Vertical slicing** in Phase 3 (one feature end-to-end per slice)
3. **S1, S2, S3 in parallel** after P2
4. **Three checkpoints** (P0, P1, P3) where you review before continuing
5. **Effort estimate** of ~10 weeks for one engineer

Reply **"plan approved"** (or with edits) and I'll start P0.1.

If you want to swap ordering (e.g. do Sessions before Ink CRUD to validate the form pattern first), tell me now.
