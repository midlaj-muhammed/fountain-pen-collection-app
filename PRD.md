# MyPen — Product Requirements Document (PRD)

> **Status:** v1.1 (2026-06-04) — updated after reviewing `figma-screens/`
> **Platform:** Mobile (iOS + Android) — React Native (Expo)
> **Backend:** Firebase (Auth + Firestore + Storage + Cloud Functions + FCM)

---

## 1. Executive Summary

**MyPen** is a mobile app for fountain pen enthusiasts to **catalog their pens and inks, log writing sessions from a calendar, track ink levels, manage nib swaps, maintain a wishlist, and view personal data**.

The product centers on six pillars (corrected from Figma review):
1. **Collection-first UX** — open the app to your pens and inks, not a blank canvas.
2. **Calendar-driven logging** — sessions are "events" added from the Calendar tab.
3. **5-dot ink level** — quick visual fill state (cartridges have no level).
4. **Wishlist** — track pens/inks you want to buy.
5. **Beautiful pen photography** — make your collection look as good as it feels.
6. **Per-item history** — see every session a pen or ink was used in.

**Target user:** Fountain pen hobbyists — beginners with a starter pen up to collectors with dozens of pens and inks.

**MVP scope:** Auth → Pen & Ink catalogs (bottles + cartridges) → Calendar with sessions → Ink level tracker (5-dot) → Nib swap history → Wishlist → Settings + reminders.

---

## 2. Goals & Non-Goals

### 2.1 Goals (MVP)
- Time-to-first-logged-session < 2 minutes from install.
- Add a pen in < 30 seconds (4 fields + optional photo).
- Add an ink in < 20 seconds (brand, name, color, size).
- Log a session from Calendar in < 15 seconds.
- Offline reads always work; writes queue and sync.
- Match the Figma design exactly (375/15/345, violet accent, 5 tabs, 2-col ink grid).

### 2.2 Non-Goals (MVP)
- Public profiles, social feed, follows (v2).
- Pen/ink marketplace (out of scope).
- Handwriting OCR / stroke analysis (v3+).
- Desktop / web (v3).
- Apple Sign In (deferred — not needed when only email + Google are offered).

### 2.3 Figma-Confirmed Facts (from `figma-screens/`)
- **Canvas:** 375px (iPhone standard)
- **Page margins:** 15px
- **Content width:** 345px
- **Accent color:** violet/purple (e.g. `#6B4FE0`) — not oxblood
- **Bottom tabs (5):** Pens / Inks / Calendar / Wishlist / Settings
- **Ink list:** 2-column grid; "Bottles" / "Cartridges" chip toggle
- **Ink level indicator:** 5 violet dots (not a continuous bar)
- **Pen list:** single column; per-row violet "+" FAB
- **Calendar:** monthly grid; violet dot on days with sessions; selected day = violet border + light violet bg; "ADD EVENT" CTA
- **"Add session"** happens from Calendar, not from a dedicated "Log" tab

---

## 3. Information Architecture & Screen List

| # | Screen | Route | Auth | Purpose |
|---|---|---|---|---|
| 1 | Splash | `/splash` | — | Brand intro, app init |
| 2 | Welcome / Onboarding | `/welcome` | No | 2–3 swipeable value props |
| 3 | Sign Up | `/auth/signup` | No | Email, Google |
| 4 | Sign In | `/auth/signin` | No | Email, Google |
| 5 | Forgot Password | `/auth/forgot` | No | Email reset link |
| 6 | **Pens** (tab) | `/pens` | Yes | Pen collection list |
| 7 | **Inks** (tab) | `/inks` | Yes | Ink collection (2-col, Bottles/Cartridges toggle) |
| 8 | **Calendar** (tab) | `/calendar` | Yes | Monthly grid; ADD EVENT = log a session |
| 9 | **Wishlist** (tab) | `/wishlist` | Yes | Pens/inks the user wants |
| 10 | **Settings** (tab) | `/settings` | Yes | Account, theme, reminders, sign out |
| 11 | Pen Detail | `/pens/:id` | Yes | Pen info, nib history, sessions used in |
| 12 | Add/Edit Pen | `/pens/new`, `/pens/:id/edit` | Yes | Form: brand, model, nib, color, photo |
| 13 | Ink Detail | `/inks/:id` | Yes | Ink info, 5-dot level, sessions used in |
| 14 | Add/Edit Ink | `/inks/new`, `/inks/:id/edit` | Yes | Brand, name, color, size, isCartridge, level |
| 15 | Add Session (from calendar) | `/calendar/:date/new-session` | Yes | Date pre-filled, pick pen + ink, duration, rating, ink dried out?, notes |
| 16 | Session Detail | `/sessions/:id` | Yes | Read/edit/delete |
| 17 | Nib Swap | `/pens/:id/nibs` | Yes | List of nibs on a pen + add swap |
| 18 | Wishlist Item Form | `/wishlist/new`, `/wishlist/:id/edit` | Yes | Type (pen/ink), brand, name, notes |
| 19 | Settings sub-screens | `/settings/*` | Yes | Theme, reminders, account, delete account |
| 20 | Profile | `/profile` | Yes | Name, avatar, plan |
| 21 | Filters (modal) | `/filters` | Yes | Date range, pen, ink, rating |
| 22 | Empty States | various | Yes | "Add your first pen/ink" prompts |
| 23 | Offline Banner | global | Yes | Top banner when offline |

---

## 4. User Flow (High-Level)

```
                ┌─────────────┐
                │  Install    │
                └──────┬──────┘
                       ▼
                 ┌───────────┐
            ┌───▶│  Splash   │──▶ auth state check ─────────┐
            │    └───────────┘                                │
            ▼                                                 │
     ┌────────────┐                                   ┌──────▼──────┐
     │  Welcome   │ (3 slides)                       │  Tabs root  │
     └─────┬──────┘                                   └──┬──┬──┬──┬┘
           │ has session?                                │  │  │  │  │
           ▼ no                                         Pens Inks Cal Wish Set
   ┌────────────────┐                                          ▲
   │  Sign Up / In  │ ◀── email, google                        │
   └────────┬───────┘                                  sessions live here
            ▼
       setup profile
```

### 4.1 Detailed Flows

**A. First-time user**
1. Splash → Welcome (3 slides) → "Get Started" CTA
2. Sign Up (email or Google) → profile name + optional avatar
3. Land on Pens tab (empty state: "Add your first pen")
4. Tap FAB on Pens tab → Add Pen form
5. Tabs available: Pens / Inks / Calendar / Wishlist / Settings

**B. Add a pen**
1. Pens tab → tap "+" FAB on a row OR header FAB → Add Pen form
2. Fields: Brand, Model, Nib size (F/M/B/etc), Nib material (steel/gold), Color, Acquisition date, Photo (optional), Notes
3. Save → returns to Pens list with new entry
4. Tap pen → Pen Detail

**C. Add an ink**
1. Inks tab → toggle "Bottles" / "Cartridges"
2. Tap "+" FAB → Add Ink form
3. Fields: Brand, Ink name, Color swatch (visual picker or hex), Bottle size (ml) — *or* marked as cartridge — Current level (5-dot picker)
4. Save → Ink Detail with 5-dot level

**D. Log a writing session**
1. Calendar tab → pick a day → "ADD EVENT" CTA
2. Form: Date (pre-filled from selected day), Pen (picker), Ink (picker), Duration (minutes), Rating (1–5), Ink dried out? (yes/no), Notes
3. Save → calendar shows violet dot on that day; day detail lists the session

**E. Nib swap**
1. Pen Detail → Nibs section → "Add swap"
2. Form: Date, Old nib (auto-suggested), New nib (size/material), Notes
3. Save → history grows; current nib updates

**F. Wishlist**
1. Wishlist tab → FAB → Add Wishlist Item
2. Form: Type (pen/ink), Brand, Name, Notes
3. Save → appears in list; check/delete actions

**G. Settings**
- Profile: name, avatar, plan
- Theme: system/light/dark
- Daily writing reminder: enable + hour picker
- Reorder alert: enable
- Sign out
- Delete account

**H. Sign out**
Settings → Sign out → confirm modal → return to Welcome.

---

## 5. Tech Stack

### 5.1 Frontend (Mobile)
| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Expo SDK 51+** (managed) | Faster dev, EAS builds, OTA updates |
| Language | **TypeScript** (strict) | Type safety |
| State (UI) | **Zustand** | Lightweight |
| State (data) | **TanStack Query** | Firestore caches, suspense-ready |
| Navigation | **React Navigation v6** (bottom tabs + native stack) | Industry standard |
| Forms | **React Hook Form** + **Zod** | Validation, minimal re-renders |
| Local DB | **Firestore SDK** (offline persistence) + **MMKV** (mirror cache) | Per decision |
| Lists | **FlashList** | Long pen/ink lists |
| Calendar | **react-native-calendars** | Heatmap, date picker |
| Icons | **Lucide React Native** | Crisp, consistent |
| Animation | **Reanimated 3** | Smooth native-thread |
| Notifications | **expo-notifications** | Local scheduled reminders |
| Image picker | **expo-image-picker** | Camera + library, compression |
| Date | **date-fns** | Tree-shakeable, immutable |

### 5.2 Backend (Firebase)
| Service | Use |
|---|---|
| **Firebase Auth** | Email/Password, Google |
| **Firestore** | Pens, inks, sessions, nibs, wishlist, user profile |
| **Firebase Storage** | Pen/ink photos, avatars |
| **Cloud Functions** | Aggregations, reorder alerts, image thumbnailing |
| **App Check** | Anti-abuse |
| **FCM** | (Optional) account-related push |

### 5.3 Dev & Ops
- **Package manager:** pnpm (via corepack)
- **Lint/Format:** ESLint + Prettier + TypeScript
- **Testing:** Jest + RNTL + Detox (E2E)
- **CI:** GitHub Actions — lint, typecheck, test on PR
- **EAS** for builds, OTA, channels (`internal`, `prod`)
- **Sentry** for error tracking

---

## 6. Frontend Design System & Guidelines

> Full detail in `SPEC.md §6`. Summary below.

### 6.1 Tokens
- Layout: 375 / 15 / 345 (canvas / margin / content)
- Accent: violet `#6B4FE0`; accentSoft `#EDE9FB`; accentDeep `#3B2A8C`
- Surfaces: bg `#FAF8F4`, bgElevated `#FFFFFF`
- 4-pt grid spacing
- Type: System (iOS) / Roboto (Android) for body; Georgia/serif optional for big titles

### 6.2 Component library (Figma-named)
- `PenListItem` — 1-col card, photo + meta, per-row FAB
- `InkListItem` / `InkBottleCard` — 2-col grid, photo + meta + 5-dot level
- `InkLevelDots` — 5 small dots representing 0/20/40/60/80/100
- `InkSwatch` — 12×12 colored dot
- `TabS` — 5-tab bottom bar (Pens / Inks / Calendar / Wishlist / Settings)
- `ButtonS` — primary/secondary/ghost, sm/md/lg
- `SectionHeader` — big bold violet h1
- `Rating` — 1–5 stars
- `Calendar` — monthly grid, violet dots on session days, violet border on selected
- `Filters` — bottom sheet, "Show" / "Sort by" pills
- `Chip` — toggle pill (Bottles/Cartridges)
- `FAB`, `EmptyState`, `Avatar`, `Toast`, `Skeleton`, `Modal`/`Sheet`, `OfflineBanner`

---

## 7. Backend Architecture & Database Structure

> Full detail in `SPEC.md §7`. Summary below.

### 7.1 Auth
- Email/Password, Google
- Profile doc on `users/{uid}` created by `onUserCreate`
- Email verification required before cloud writes
- Account deletion cascades via `deleteUserData`

### 7.2 Data model (Firestore)
```
users/{uid}/pens/{penId}     — brand, model, nibSize, nibMaterial, color, photo, ...
users/{uid}/inks/{inkId}     — brand, name, colorHex, bottleSizeMl, currentLevelPct,
                                isCartridge, photo, ...
users/{uid}/sessions/{id}    — date, durationMin, penId, inkId, inkDriedOut, rating, notes
users/{uid}/nibSwaps/{id}    — penId, date, fromNib, toNib, notes
users/{uid}/wishlist/{id}    — type ('pen'|'ink'), brand, name, notes
```

### 7.3 Cloud Functions
- `onUserCreate`, `onUserDelete`
- `onSessionWrite` → increment pen/ink counters, update `ink.lastUsedAt`
- `onInkLevelUpdate` → reorder notification when ink < 20% + last used > 14d
- `purgeTrash` (scheduled daily) → hard-delete after 30d
- `generateThumbnails` (Storage onFinalize) → 256/64 px thumbs

### 7.4 Offline & sync
- Firestore offline persistence enabled
- MMKV mirror for cold-start render
- LWW conflict resolution for MVP
- `NetInfo` for top-of-screen `OfflineBanner`

### 7.5 Notifications
- Local only via `expo-notifications`
- Daily writing reminder at user-chosen hour
- Reorder alert when criteria met

---

## 8. Implementation Plan & Build Sequence

> Full plan: `tasks/plan.md`. Summary:
- **P0 Foundation** (1 wk) — Expo + TS + Firebase + CI
- **P1 Design System** (2 wks) — tokens + Figma-named components + a11y
- **P2 Auth** (1 wk) — Email + Google + route guards
- **P3 Core Features** (3 wks) — vertical slices: Pens / Inks / Calendar+Sessions / Wishlist / Nibs / Settings+Reminders / Offline
- **P4 Testing & Release** (3 wks) — coverage, E2E, perf, a11y, beta, store

---

## 9. Open Questions
1. **Drain model** — does logging a session auto-decrement `ink.currentLevelPct`? Recommend: no auto-drain in MVP; user adjusts manually via "fill/empty" buttons.
2. **Nib swap** — does the pen auto-update `currentInkId` or just history? Recommend: only updates nib fields, not ink.
3. **Wishlist linkage** — freeform (recommended for MVP) vs. linking to a real catalogue pen/ink.
4. **Calendar library** — confirm `react-native-calendars` works for the violet-dot heatmap, or specify alternative.
5. **Apple Sign In** — confirm deferring to v2 is fine (not required by App Store when only email + Google are offered).

---

## 10. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| **North-Star: Weekly Active Loggers** | 30% of installs |
| D1 / D7 / D30 retention | 45% / 25% / 12% |
| Avg pens per user | ≥ 3 |
| Avg inks per user | ≥ 5 |
| Avg sessions per WAU per week | ≥ 3 |
| Crash-free sessions | ≥ 99.5% |
| App Store rating | ≥ 4.5★ |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `react-native-calendars` doesn't render the violet dot indicator cleanly | Medium | Spike in P3.1; if poor, swap to custom grid with `react-native-calendar-events` or hand-rolled |
| 2-col ink grid + per-row "+" FAB on Pens list is heavy | Low | Use FlashList; lazy-load images |
| Photo-heavy collection kills storage budget | Medium | Thumbnail Cloud Function; cap upload at 10 MB; encourage downscaling |
| Offline conflict on concurrent edits | Low | LWW for MVP |
| Daily reminder feels naggy | Low | Default OFF; easy to disable |

---

*End of PRD v1.1 — see SPEC.md for build details and tasks/plan.md for the implementation plan.*
