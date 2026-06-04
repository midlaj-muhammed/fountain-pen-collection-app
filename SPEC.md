# MyPen — SPEC.md

> **Version:** 1.1 (2026-06-04) — updated after reviewing `figma-screens/`
> **Status:** Draft — confirm with user before building
> **Companion to:** `PRD.md`

This spec defines the **working agreement** for building MyPen. It is the source of truth for commands, structure, code style, testing, and boundaries. The PRD defines *what* we build; this file defines *how* we build and *what we don't do*.

---

## 1. Objective

Ship a **Fountain Pen Collection & Usage Tracker** mobile app (iOS + Android) using **React Native (Expo) + Firebase (Auth, Firestore, Storage, Cloud Functions)**. Users can:

- Catalog **pens** and **inks** (with photos, colors, metadata)
- **Log writing sessions** from the Calendar tab ("Add event" = "Add session")
- **Track ink levels** (5-dot indicator) and manage **nib swaps**
- Maintain a **Wishlist** of pens/inks to buy
- View personal data in calendar + per-item history
- Receive a **daily writing reminder** and **reorder alerts**

**Primary success metric:** Weekly Active Loggers (WAU who log ≥ 1 session) ≥ 30% of installs at 90 days.

**Figma-confirmed:** 5 tabs = **Pens / Inks / Calendar / Wishlist / Settings** (the PRD's "Log / Stats" tabs are wrong; the Calendar tab *is* the logging surface).

---

## 2. Commands

All commands run from the project root. Package manager: **pnpm** (via corepack).

### 2.1 Project lifecycle
| Command | Purpose |
|---|---|
| `pnpm install` | Install deps |
| `pnpm start` | Start Expo dev server |
| `pnpm ios` | Run on iOS simulator |
| `pnpm android` | Run on Android emulator |

### 2.2 Code quality
| Command | Purpose |
|---|---|
| `pnpm lint` | ESLint over `src/` |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Jest unit + component tests |
| `pnpm test:watch` | Jest watch mode |
| `pnpm test:e2e` | Detox E2E (iOS sim) |
| `pnpm test:e2e:build` | Rebuild native apps for Detox |

### 2.3 Builds & deploys
| Command | Purpose |
|---|---|
| `eas build --profile development` | Internal dev client build |
| `eas build --profile preview` | Internal track (TestFlight / internal Play) |
| `eas build --profile production` | Store build |
| `eas submit --platform ios` | Submit to App Store |
| `eas submit --platform android` | Submit to Play Store |
| `eas update --branch prod` | OTA update to production |
| `pnpm functions:serve` | Local Firebase emulator for Cloud Functions |
| `pnpm functions:deploy` | Deploy functions to prod |
| `pnpm deploy:rules` | Deploy Firestore + Storage rules |

### 2.4 Git hooks (Husky)
- `pre-commit`: `lint-staged` runs Prettier + ESLint on staged files
- `pre-push`: `pnpm typecheck && pnpm test --bail`

---

## 3. Project Structure

```
MyPen/
├── PRD.md                         # Product requirements
├── SPEC.md                        # This file
├── figma-screens/                 # Source-of-truth design frames
├── app.json                       # Expo config
├── eas.json                       # EAS build profiles
├── package.json
├── tsconfig.json                  # strict
├── .eslintrc.cjs
├── .prettierrc
├── babel.config.js
├── metro.config.js
├── assets/                        # Splash, icons, fonts
├── src/
│   ├── app/                       # App entry, providers, root navigation
│   │   ├── App.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   └── NetInfoProvider.tsx
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthStack.tsx
│   │   │   ├── MainTabs.tsx        # Pens / Inks / Calendar / Wishlist / Settings
│   │   │   ├── PenStack.tsx
│   │   │   ├── InkStack.tsx
│   │   │   ├── CalendarStack.tsx
│   │   │   ├── WishlistStack.tsx
│   │   │   └── types.ts
│   │   └── routes.ts
│   ├── design/                    # Design system
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── radius.ts
│   │   │   ├── layout.ts
│   │   │   └── motion.ts
│   │   ├── theme/
│   │   │   ├── light.ts
│   │   │   ├── dark.ts
│   │   │   └── useTheme.ts
│   │   ├── components/             # Figma-named components
│   │   │   ├── PenListItem/         # 1-col card w/ photo + meta + FAB-per-row
│   │   │   ├── InkListItem/         # 2-col card w/ photo + meta + 5-dot level
│   │   │   ├── TabS/                # Bottom tab bar (5 tabs)
│   │   │   ├── ButtonS/             # primary/secondary/ghost
│   │   │   ├── SectionHeader/       # "My Pens" big bold violet title
│   │   │   ├── Rating/              # 1-5 stars
│   │   │   ├── Calendar/            # monthly grid + violet dot markers
│   │   │   ├── Filters/             # bottom sheet, multi-section
│   │   │   ├── InkLevelDots/        # 5 filled/empty dots
│   │   │   ├── InkSwatch/           # small colored dot
│   │   │   ├── InkBottleCard/       # 2-col grid card
│   │   │   ├── EmptyState/
│   │   │   ├── Avatar/
│   │   │   ├── Chip/                # "Bottles" / "Cartridges" toggle
│   │   │   ├── FAB/                 # 44pt violet circle
│   │   │   ├── Toast/
│   │   │   ├── Skeleton/
│   │   │   ├── Modal/               # Sheet, Dialog
│   │   │   └── OfflineBanner/       # top-of-screen offline state
│   │   └── primitives/             # Box, Stack, Text, Pressable
│   ├── features/                  # Feature modules
│   │   ├── auth/                   # Welcome, SignIn, SignUp, Forgot
│   │   ├── pens/                   # List, Detail, Form (Add/Edit)
│   │   ├── inks/                   # List (2-col), Detail, Form, Bottles/Cartridges toggle
│   │   ├── sessions/               # Calendar event = writing session
│   │   ├── nibs/                   # Nib swap list + form (per pen)
│   │   ├── calendar/               # Calendar tab + day detail
│   │   ├── wishlist/               # Wishlist tab + add item
│   │   ├── settings/
│   │   ├── profile/
│   │   └── filters/                # shared filter sheet (Show, Sort by)
│   ├── lib/                        # Generic utilities
│   │   ├── firebase/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   ├── storage.ts
│   │   │   └── functions.ts
│   │   ├── mmkv/
│   │   ├── notifications/
│   │   ├── netinfo/
│   │   ├── images/
│   │   ├── dates/
│   │   ├── validation/             # zod schemas
│   │   └── log.ts
│   ├── store/                     # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── reminderStore.ts
│   ├── types/                     # Shared TypeScript types
│   │   ├── domain.ts               # Pen, Ink, Session, NibSwap, WishlistItem
│   │   ├── api.ts
│   │   └── env.d.ts
│   └── config/
│       ├── env.ts
│       └── constants.ts
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── onUserCreate.ts
│   │   ├── onUserDelete.ts
│   │   ├── onSessionWrite.ts
│   │   ├── onInkLevelUpdate.ts
│   │   ├── purgeTrash.ts
│   │   ├── generateThumbnails.ts
│   │   ├── monthlyStats.ts
│   │   └── exportUserData.ts
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules
├── storage.rules
├── firebase.json
├── .firebaserc
├── e2e/                           # Detox tests
│   ├── specs/
│   └── jest.config.js
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy-functions.yml
```

### 3.1 Folder rules
- `design/` has **zero business logic** — pure presentation, fully themable.
- `features/*` is the only place domain logic lives.
- `lib/` is **dependency-free of features** (one-way: features → lib).
- `store/` is for **UI/auth state only**; data caching lives in TanStack Query.

---

## 4. Code Style

### 4.1 TypeScript
- **Strict mode** (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`).
- **No `any`**. Use `unknown` + narrowing, or define a type.
- **No enums** — use string-literal unions or `as const` objects.
- Prefer `type` for unions/aliases; `interface` only for extensible objects.
- Domain types live in `src/types/domain.ts`; feature-local types live next to the feature.

### 4.2 Naming
- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for everything else.
- **Components:** `PascalCase`, one component per file, named export.
- **Hooks:** `useX` prefix; colocate in `features/x/hooks/`.
- **Screens:** file is `PenList.tsx`, default export the component.
- **Stores:** `useXStore` (e.g. `useAuthStore`).
- **Constants:** `SCREAMING_SNAKE` only for true constants; `camelCase` for config objects.
- **Boolean variables:** `is*`, `has*`, `should*`, `can*`.

### 4.3 React
- **Function components only.** No class components.
- **Hooks rules:** no conditional hooks; exhaustive deps; custom hooks prefixed `use`.
- **Props:** destructure in signature; define `type XProps = {...}` above the component.
- **Refs:** use `useRef` for imperative handles only; prefer callback refs for measurements.
- **Lists:** always use `key` based on stable id, never index.
- **Memoize** only when measured necessary (FlashList items, expensive renders).

### 4.4 Imports
- Use the `@/` path alias for `src/`.
- Group: 1) external 2) `@/` internal 3) relative — separated by blank lines.
- ESLint enforces `import/order`.

### 4.5 Formatting
- **Prettier**: 2 spaces, single quotes, trailing commas (all), 100 col width, semicolons.
- **ESLint**: `@typescript-eslint/recommended`, `react`, `react-hooks`, `react-native`, `import`, `jsx-a11y`. No `any` rule.

### 4.6 Error handling
- Wrap Firebase calls in a `try/catch` at the API layer; throw a typed `AppError` with `code`, `message`, `cause`.
- UI surfaces errors via `<Toast>`; never raw `console.error` to users.
- All catch blocks log to Sentry (`lib/log.ts`).

### 4.7 Comments
- **Why, not what.** No "this function adds two numbers."
- JSDoc only on public APIs and exported utilities.

### 4.8 Git
- **Branch naming:** `feat/<scope>-<short>`, `fix/<scope>-<short>`, `chore/<short>`.
- **Commit messages:** Conventional Commits (`feat(pens): add nib swap form`).
- **PRs:** title + 1-paragraph description + screenshots for UI changes.
- **Rebase** before merge; squash on merge to `main`.

---

## 5. Testing Strategy

### 5.1 Levels
| Level | Tool | Target | Where |
|---|---|---|---|
| Unit | Jest | `lib/`, hooks, reducers | `*.test.ts(x)` next to source |
| Component | Jest + RNTL | Design system components, feature components | `*.test.tsx` next to source |
| Integration | Jest + RNTL | Feature flows with mocked Firebase | `features/x/__tests__/` |
| E2E | Detox | Critical user paths | `e2e/specs/` |

### 5.2 Coverage targets
- `lib/`: **80%** lines
- `features/*/hooks/`: **70%** lines
- `design/components/`: **60%** lines
- Overall: **60%** lines

### 5.3 E2E specs (required before release)
1. **Signup → add pen → add ink → add session from calendar → see in calendar**
2. **Offline write → reconnect → syncs**
3. **Ink level dots update after fill/empty**
4. **Wishlist add → remove → check in list**
5. **Daily reminder fires at configured hour (manual test in dev)**

### 5.4 What we test
- **Test behavior, not implementation.** Don't assert on internal state; assert on what the user sees/does.
- **Don't snapshot-test styled output** — visual review via Storybook.
- **Mock Firebase at the API layer**, not at the SDK level.

### 5.5 What we don't test
- Generated code, third-party libs, pure pass-through components.

### 5.6 Test data
- Factories from `src/lib/test/factories.ts` (e.g. `makePen(overrides)`).
- No real user data; E2E uses Firebase emulators.

---

## 6. Frontend Design System & Guidelines

> **Confirmed from `figma-screens/`:** 375px canvas, 15px page margins, 345px content width, accent color is **violet/purple**. Components: `PenListItem`, `InkListItem` (2-col), `TabS` (5 tabs), `ButtonS`, `SectionHeader`, `Rating`, `Calendar` (with violet day dots), `Filters`, `InkLevelDots` (5 dots, not a bar), `InkSwatch`, `Chip`, `FAB`, `OfflineBanner`.

### 6.1 Design Principles
1. **Collection-first** — show the objects (pens, inks) prominently with rich imagery.
2. **Calm paper feel** — soft off-white backgrounds, generous spacing, no busy gradients.
3. **Violet warmth** — single accent (violet) used for actions, selected states, and brand moments. Light violet tints for selected day cells and active chips.
4. **Tactile motion** — subtle springs, never bouncy.

### 6.2 Layout Tokens (Figma-confirmed)
```ts
export const layout = {
  canvas:        375,   // px — iPhone standard
  pageMargin:    15,    // px
  contentWidth:  345,   // px (= 375 - 15*2)
  radius:        { sm: 6, md: 10, lg: 16, pill: 999 },
};
```

### 6.3 Color Tokens
```ts
export const colors = {
  // Brand
  primary:        '#1A1A1A',   // ink black — primary text
  primarySoft:    '#2C2C2C',
  accent:         '#6B4FE0',   // violet — primary action (FAB, ADD NEW, active tab)
  accentSoft:     '#EDE9FB',   // light violet tint (selected day, active chip)
  accentDeep:     '#3B2A8C',   // deeper violet for pressed states

  // Surfaces
  bg:             '#FAF8F4',   // paper cream
  bgElevated:     '#FFFFFF',   // card background
  bgMuted:        '#F0EDE5',

  // Text
  text:           '#1A1A1A',
  textMuted:      '#6B6B6B',
  textInverse:    '#FFFFFF',

  // Lines
  border:         '#E5E0D5',
  divider:        '#EDEAE0',

  // States
  success:        '#2F6B4A',
  warning:        '#B07A1A',
  danger:         '#A3322A',
  info:           '#2E5C8A',

  // Rating
  star:           '#E0A100',
  starEmpty:      '#D8D2C2',

  // Ink dot indicator (matches Figma: 5 violet dots, 4 grey for empty)
  inkDot:         '#6B4FE0',
  inkDotEmpty:    '#D8D2C2',

  // Dark
  darkBg:         '#0F0F10',
  darkSurface:    '#1A1A1C',
  darkText:       '#F2F2F2',
  darkMuted:      '#9A9A9A',
  darkBorder:     '#2A2A2C',
  darkAccent:     '#8A73E8',
  darkAccentSoft: '#2A2546',
};
```

### 6.4 Typography
```ts
export const type = {
  fontSans: Platform.select({ ios: 'System', android: 'Roboto' }),
  fontSerif: Platform.select({ ios: 'Georgia', android: 'serif' }), // for titles (e.g. "My Pens")

  display:    { size: 32, lineHeight: 40, weight: '700' },
  h1:         { size: 28, lineHeight: 36, weight: '700' },   // screen titles ("My Pens")
  h2:         { size: 20, lineHeight: 28, weight: '600' },
  h3:         { size: 17, lineHeight: 24, weight: '600' },
  body:       { size: 16, lineHeight: 24, weight: '400' },
  bodyBold:   { size: 16, lineHeight: 24, weight: '600' },
  small:      { size: 13, lineHeight: 18, weight: '400' },
  caption:    { size: 11, lineHeight: 14, weight: '500' },
  button:     { size: 14, lineHeight: 20, weight: '700', letterSpacing: 0.5 }, // ADD NEW, ADD EVENT (uppercased)
};
```

### 6.5 Spacing
- **4-pt grid:** `space = { xxs:2, xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48 }`

### 6.6 Component Library (Figma-named)

| Component | Spec |
|---|---|
| **PenListItem** | 345w, full-width card. Photo left 80×80 rounded-md. Brand (caption muted) + model (h3) + "Last used X ago" (caption). Right: usage count, nib chip, small drop/warning icons, **violet "+" FAB per row**. |
| **InkListItem / InkBottleCard** | 2-col grid. Photo top 80h. Brand (caption) + name (h3) + color swatch dot + color name. Bottom: ml + **5 InkLevelDots**. |
| **TabS** | Bottom tab bar with 5 tabs. Active: filled violet icon + violet label. Inactive: outline gray. Height: 56 + safe area. |
| **ButtonS** | Variants: primary (filled violet), secondary (outline), ghost. Sizes: sm (36h), md (44h), lg (52h). Radius `md`. Uppercase labels with letter spacing for "ADD NEW" / "ADD EVENT". |
| **SectionHeader** | Big bold violet title (h1) at top of screen, e.g. "My Pens", "Calendar". Optional right-side action (3-dot menu, ADD button). |
| **Rating** | 5 stars, 24pt each. Read-only and interactive modes. |
| **Calendar** | Monthly grid. Selected day: violet border + light violet bg. Days with sessions: small violet dot. "ADD EVENT" CTA. Shows month name + chevron arrows. |
| **Filters** | Bottom sheet. Chips for "Show" and "Sort by" with dropdown arrow. Apply / Reset. |
| **InkLevelDots** | Row of 5 small filled/empty violet dots, representing 0/20/40/60/80/100% in 5 steps. |
| **InkSwatch** | 12×12 colored dot before ink color name (e.g. "● Aquamarine"). |
| **Chip** | Pill button used for "Bottles" / "Cartridges" tabs. Active: filled violet. Inactive: outline gray. |
| **QuickLog** | (Phase 2 — calendar-driven; no separate Quick Log in v1.1. Users add sessions from the Calendar tab "ADD EVENT".) |
| **EmptyState** | Centered illustration slot, h2 headline, body text muted, primary CTA. |
| **Avatar** | Sizes 24/32/48/64. Initials fallback. |
| **FAB** | 44×44 filled violet circle with white icon. Used both globally and per-row in pen list. |
| **Toast** | Top, 3s auto-dismiss. |
| **Skeleton** | List and text variants. |
| **Modal / Sheet** | Bottom sheet, drag-to-dismiss. |
| **OfflineBanner** | Top-of-screen thin banner shown when NetInfo reports offline. Matches `figma-screens/Offline Headers@3x.png`. |

### 6.7 Iconography
- **Lucide** — 24×24 default, stroke 2.
- Brand icon: pen nib mark for app icon.

### 6.8 Motion
| Token | Value |
|---|---|
| `motion.duration.fast` | 120ms |
| `motion.duration.base` | 220ms |
| `motion.duration.slow` | 360ms |
| `motion.ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion.ease.emphasized` | `cubic-bezier(0.3, 0, 0, 1)` |

### 6.9 Accessibility
- Contrast 4.5:1 body, 3:1 large.
- Hit targets ≥ 44×44pt.
- Dynamic Type support.
- Screen reader labels on icon buttons.
- Respect `prefers-reduced-motion`.

### 6.10 Dark Mode
- Token swap, full map.
- In dark mode, use `darkAccent` (`#8A73E8`) for actions, `darkAccentSoft` for selected states.

---

## 7. Backend Architecture & Database Structure

### 7.1 High-Level Architecture
```
┌──────────────┐   HTTPS/WS   ┌──────────────────────┐
│  Mobile App  │ ───────────▶ │ Firebase (GCP)       │
│  (Expo)      │              │  • Auth              │
│              │              │  • Firestore         │
│  • Zustand   │              │  • Storage           │
│  • MMKV      │              │  • Cloud Functions   │
│  • TanStack  │              │  • App Check         │
│    Query     │              │  • FCM (optional)    │
└──────┬───────┘              └──────────┬───────────┘
       │                                 │
       │  offline write                  │
       ▼                                 ▼
   MMKV cache ─────── sync on reconnect ──────▶
```

### 7.2 Auth (Firebase Authentication)
- **Providers:** Email/Password, Google.
- **Account model:** `users/{uid}` doc; Auth user + custom claims `{ plan: 'free' | 'pro' }`.
- **Session:** persistent; silent refresh on app launch.
- **Password policy:** min 8 chars.
- **Email verification:** required for email/password signup before cloud writes allowed.
- **Account deletion:** user-initiated → Cloud Function `deleteUserData` cascade.

### 7.3 Firestore Data Model

**Conventions**
- All docs have `createdAt` and `updatedAt` server timestamps.
- Soft-delete via `deletedAt: Timestamp | null`; hard-delete after 30 days.
- All reads/writes scoped by `request.auth.uid`.

```
users/{uid}
  displayName: string
  email: string
  photoURL: string | null
  emailVerified: bool
  plan: 'free' | 'pro'
  createdAt: Timestamp
  updatedAt: Timestamp
  settings: {
    theme: 'light' | 'dark' | 'system'
    fontSize: 'sm' | 'md' | 'lg'
    reminderEnabled: bool
    reminderHour: number
    reorderAlertEnabled: bool
  }

users/{uid}/pens/{penId}
  brand: string
  model: string
  nibSize: 'EF' | 'F' | 'M' | 'B' | 'BB' | 'Custom'
  nibMaterial: 'steel' | 'gold' | 'other'
  nibCustomLabel: string | null
  color: string                      // hex (pen body)
  photoURL: string | null
  acquiredAt: Timestamp | null
  retired: bool
  currentInkId: string | null
  notes: string
  totalSessions: number
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null

users/{uid}/inks/{inkId}
  brand: string
  name: string
  colorHex: string
  bottleSizeMl: number
  currentLevelPct: number            // 0, 20, 40, 60, 80, 100
  isCartridge: bool                  // true = cartridge (no level), false = bottle
  photoURL: string | null
  acquiredAt: Timestamp | null
  empty: bool
  totalSessions: number
  lastUsedAt: Timestamp | null
  notes: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null

users/{uid}/sessions/{sessionId}
  date: Timestamp
  durationMin: number
  penId: string
  inkId: string
  inkDriedOut: bool                  // from Figma: "Pen Single - add session - ink dry yes/no"
  rating: number                     // 1–5
  notes: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null

users/{uid}/nibSwaps/{swapId}
  penId: string
  date: Timestamp
  fromNib: { size: string, material: string, label: string | null }
  toNib:   { size: string, material: string, label: string | null }
  notes: string
  createdAt: Timestamp

users/{uid}/wishlist/{itemId}
  type: 'pen' | 'ink'
  brand: string
  name: string
  notes: string
  createdAt: Timestamp
  deletedAt: Timestamp | null
```

**Indexes (composite)**
- `pens` by `deletedAt asc, updatedAt desc`
- `inks` by `deletedAt asc, updatedAt desc`
- `sessions` by `deletedAt asc, date desc`
- `sessions` by `penId asc, date desc`
- `sessions` by `inkId asc, date desc`
- `sessions` by `date asc` (calendar lookup)

### 7.4 Cloud Functions
| Function | Trigger | Purpose |
|---|---|---|
| `onUserCreate` | Auth onCreate | Provision `users/{uid}` |
| `onUserDelete` | Auth onDelete | Cascade-delete user data |
| `onSessionWrite` | Firestore onWrite | Increment pen & ink `totalSessions`; update `ink.lastUsedAt` |
| `onInkLevelUpdate` | Firestore onUpdate | If level crosses 20% and last used > 14d ago, queue a "reorder" notification record |
| `purgeTrash` | Scheduled (daily) | Hard-delete soft-deleted docs after 30d |
| `generateThumbnails` | Storage onFinalize | 256px + 64px thumbnails for pen/ink photos |

### 7.5 Security Rules (Firestore)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /users/{uid} {
      allow read, write: if isOwner(uid);
      match /{document=**} {
        allow read, write: if isOwner(uid);
      }
    }
  }
}
```

### 7.6 Storage Rules
- `/avatars/{uid}/{file}` — read public, write owner-only, ≤ 2 MB, image.
- `/photos/pens/{uid}/{penId}/{file}` — owner-only, ≤ 10 MB, image.
- `/photos/inks/{uid}/{inkId}/{file}` — owner-only, ≤ 10 MB, image.

### 7.7 Offline & Sync Strategy
- Firestore offline persistence enabled.
- MMKV mirror for cold-start render.
- **Conflict resolution:** LWW by `updatedAt` for MVP.
- Network state banner via `NetInfo`; auto-retry with backoff.

### 7.8 Notifications (Local, MVP)
- `expo-notifications` schedules local notifications.
- **Daily writing reminder** at `reminderHour` (default 20:00 local), only if no session logged today.
- **Reorder alert** when an ink meets criteria — surfaced as in-app banner on Home + optional local notification.

---

## 8. Implementation Plan & Build Sequence

> See `tasks/plan.md` for the full vertical-slice plan with dependency graph and 35 tasks across 5 phases.

---

## 9. Open Questions (Resolve Before Phase 1)
1. **Drain model** — does logging a session auto-decrement `ink.currentLevelPct`? Recommend: no auto-drain in MVP; user adjusts manually or via "fill/empty" buttons. (Affects §7.4 `onSessionWrite`.)
2. **Nib swap default** — does the pen auto-update `currentInkId` or just history? Recommend: only updates nib fields, not ink.
3. **Wishlist data** — does the user link to a real pen/ink in the catalogue, or is the wishlist fully freeform? Recommend: freeform for MVP (just brand + name + notes).
4. **Calendar library** — confirm `react-native-calendars` is fine, or specify alternative.

---

## 10. Pre-build Checklist
- [x] Product = pen & ink tracker
- [x] Framework = Expo managed
- [x] State = Zustand + TanStack Query
- [x] Local = Firestore SDK + MMKV cache
- [x] Auth = Email + Google
- [x] Social = personal only
- [x] Images = Firebase Storage uploads
- [x] Notifications = daily reminder + reorder alerts
- [x] **Tabs = Pens / Inks / Calendar / Wishlist / Settings** (corrected from PRD v1.0)
- [x] **Accent = violet** (corrected from PRD v1.0)
- [x] **InkLevelDots (5-dot, not bar) — confirmed from Figma**
- [x] **InkListItem = 2-col grid — confirmed from Figma**
- [x] **Ink `isCartridge` flag — added to model**
- [x] **Session `inkDriedOut` flag — added to model**
- [x] **Wishlist feature — added to data model + navigation**
- [ ] Resolve PRD §9 open questions
- [ ] Firebase project + EAS project created
- [ ] This SPEC.md approved by user

---

*End of SPEC v1.1 — sign off before Phase 1.*
