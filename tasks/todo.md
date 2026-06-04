# MyPen — Task List (todo)

> **Generated from:** `tasks/plan.md` v1.0
> **Total tasks:** 35
> **Status legend:** `pending` → `in_progress` → `done`

## P0 — Foundation (5 tasks)
- [ ] **P0.1** — Bootstrap Expo + TypeScript
- [ ] **P0.2** — Lint, format, git hooks
- [ ] **P0.3** — Folder skeleton + base providers
- [ ] **P0.4** — Firebase project + client wiring
- [ ] **P0.5** — CI + EAS
- **🛑 Checkpoint P0** — Human review

## P1 — Design System (4 tasks)
- [ ] **P1.1** — Tokens (colors, type, spacing, layout, motion)
- [ ] **P1.2** — Primitives (Box, Stack, Text, Pressable)
- [ ] **P1.3** — Figma-named components (ButtonS, TabS, SectionHeader, Rating, Calendar, Filters, PenListItem, InkListItem, InkLevelBar, QuickLog, EmptyState, Avatar, Chip, FAB, Toast, Skeleton, Modal/Sheet)
- [ ] **P1.4** — A11y audit
- **🛑 Checkpoint P1** — Human review of Storybook

## P2 — Authentication (3 tasks)
- [ ] **P2.1** — Auth context + Firebase wrappers
- [ ] **P2.2** — Welcome + Sign Up + Sign In + Forgot screens
- [ ] **P2.3** — Route guards + profile creation
- **🛑 Checkpoint P2** — Human review of auth flow

## P3 — Core Features (8 slices, 32 tasks)
- [ ] **S1** — Pens CRUD
  - [ ] S1.1 Pen data layer
  - [ ] S1.2 Add/Edit Pen form
  - [ ] S1.3 Pen list + detail
  - [ ] S1.4 Soft-delete + restore hook
- [ ] **S2** — Inks CRUD
  - [ ] S2.1 Ink data layer
  - [ ] S2.2 Ink form (with level bar)
  - [ ] S2.3 Ink list + detail
  - [ ] S2.4 Soft-delete
- [ ] **S3** — Home dashboard
  - [ ] S3.1 Home screen
  - [ ] S3.2 Quick Log (1-tap)
- [ ] **S4** — Sessions
  - [ ] S4.1 Session data layer + `onSessionWrite` function
  - [ ] S4.2 Session form
  - [ ] S4.3 Session list (date-grouped)
- [ ] **S5** — Nib swaps
  - [ ] S5.1 Nib data layer
  - [ ] S5.2 Nib swap form + history
- [ ] **S6** — Stats
  - [ ] S6.1 Stats data layer
  - [ ] S6.2 Stats screen
  - [ ] S6.3 Filters
- [ ] **S7** — Settings + Reminders + Profile
  - [ ] S7.1 Profile screen
  - [ ] S7.2 Settings screen
  - [ ] S7.3 Notifications
  - [ ] S7.4 Delete account
- [ ] **S8** — Offline + Sync + Polish
  - [ ] S8.1 Firestore offline persistence
  - [ ] S8.2 MMKV cold-start mirror
  - [ ] S8.3 Network banner
  - [ ] S8.4 Error toasts + retry
- **🛑 Checkpoint P3** — Human review of full app

## P4 — Testing & Release (6 tasks)
- [ ] **P4.1** — Unit + component test coverage
- [ ] **P4.2** — Detox E2E pass
- [ ] **P4.3** — Performance pass
- [ ] **P4.4** — A11y final pass
- [ ] **P4.5** — Beta release
- [ ] **P4.6** — Store release

---

**Next action:** Approve `tasks/plan.md` to begin P0.1.
