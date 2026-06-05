# P4 — Testing & Release

## P4.1 — Coverage gates

Coverage thresholds (enforced in CI via `jest.config.js`):

| Path | Lines | Statements | Functions | Branches |
| --- | --- | --- | --- | --- |
| global | 65% | 65% | 60% | 55% |
| `src/lib/` | 80% | 80% | — | — |
| `src/features/` | 60% | 60% | — | — |

Navigation glue files (`src/app/navigation/**/*.tsx`,
`src/features/**/navigation/*.tsx`) are excluded from coverage — they
are mounted by E2E specs (P4.2), not unit tests, and their function
count is dominated by React Navigation's render-prop callbacks.

Current coverage (post-P4.1):

```
All files                        |   83.85 |    72.29 |   79.76 |   85.36 |
features/pens/api                |   95.23 |       75 |   92.59 |   94.87 |
features/inks/api                |   93.18 |       85 |   90.9  |   92.5  |
features/sessions/api            |   88.46 |    71.87 |   84.84 |   89.85 |
features/stats/api               |   88.05 |    80.85 |    100  |   90.74 |
features/home/components/QuickLog|   89.65 |    82.6  |   71.42 |   95.83 |
lib/firebase                     |   80.26 |    51.61 |   91.66 |   82.35 |
lib/retry                        |   94.11 |    81.81 |    100  |    100  |
lib/toast                        |   85.18 |    71.42 |   85.71 |   87.5  |
```

How to run:

```bash
pnpm test               # all unit + component tests
pnpm test -- --coverage # with coverage report
```

## P4.2 — Detox E2E

Specs live in `e2e/*.e2e.ts`. To run them locally:

```bash
# Build the native dev client and start the emulator
eas build --profile development --platform ios
pnpm ios

# In a second terminal
pnpm test:e2e -- --spec e2e/auth.e2e.ts
```

Specs cover:

- `auth.e2e.ts` — welcome → sign up → home → sign out
- `pens.e2e.ts` — add, edit, soft-delete a pen
- `inks.e2e.ts` — add a bottle ink, switch to cartridges
- `quick-log.e2e.ts` — 1-tap session from Home
- `sessions.e2e.ts` — Today bucket on the sessions list
- `stats.e2e.ts` — totals, top pens, top inks, monthly bars
- `settings.e2e.ts` — reminder toggle, hour picker, delete account entry
- `delete-account.e2e.ts` — full delete flow (calls `deleteUserData`)

CI: P4.2 specs run on a `macos-latest` GitHub Actions runner with the
iPhone 15 simulator. See `.github/workflows/ci.yml` (added in P0.5).

## P4.3 — Performance

Targets (per `tasks/plan.md`):

- Cold start: < 1.5s on a mid-tier Android device
- List scroll: 60fps on Pens / Inks / Sessions lists
- Image upload: < 2s for 1MB photos

See `docs/perf-p4.md` for measurements and the optimisation plan
(lazy-load the editor toolbar, FlashList everywhere, image compression
at upload time).

## P4.4 — Accessibility

See `docs/a11y-p4.md` for the per-flow VoiceOver / TalkBack checklist.

## P4.5 — Beta release

See `docs/beta-p4.md` for the TestFlight / internal Play checklist.

## P4.6 — Store release

See `docs/release-p4.md` for the App Store / Play Store submission
checklist.
