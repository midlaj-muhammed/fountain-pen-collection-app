/**
 * Motion tokens. Durations are in milliseconds. Easing curves follow
 * Material Design 3 / iOS-aligned standards.
 *
 * - `standard` — most page transitions, sheets, fades.
 * - `emphasized` — important element entry (e.g. result of a quick action).
 */
export const motion = {
  duration: {
    fast: 120,
    base: 220,
    slow: 360,
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  },
} as const;
