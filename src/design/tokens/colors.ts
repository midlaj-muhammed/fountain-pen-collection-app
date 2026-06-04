/**
 * Color tokens — single source of truth for the app's color palette.
 *
 * Sourced from `figma-screens/` (42 frames reviewed 2026-06-04).
 * All values are 6-digit hex strings; do not introduce rgba/hex-with-alpha
 * without a corresponding token change.
 */
export const colors = {
  // ── Brand ──────────────────────────────────────────────
  primary: '#1A1A1A', // ink black — primary text
  primarySoft: '#2C2C2C',
  accent: '#6B4FE0', // violet — primary action (FAB, ADD NEW, active tab)
  accentSoft: '#EDE9FB', // light violet (selected day, active chip)
  accentDeep: '#3B2A8C', // deeper violet (pressed)

  // ── Surfaces ───────────────────────────────────────────
  bg: '#FAF8F4', // paper cream
  bgElevated: '#FFFFFF', // card
  bgMuted: '#F0EDE5',

  // ── Text ───────────────────────────────────────────────
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textInverse: '#FFFFFF',

  // ── Lines ──────────────────────────────────────────────
  border: '#E5E0D5',
  divider: '#EDEAE0',

  // ── States ─────────────────────────────────────────────
  success: '#2F6B4A',
  warning: '#B07A1A',
  danger: '#A3322A',
  info: '#2E5C8A',

  // ── Rating ─────────────────────────────────────────────
  star: '#E0A100',
  starEmpty: '#D8D2C2',

  // ── Ink level (5-dot indicator) ────────────────────────
  inkDot: '#6B4FE0', // filled
  inkDotEmpty: '#D8D2C2', // empty

  // ── Dark ───────────────────────────────────────────────
  darkBg: '#0F0F10',
  darkSurface: '#1A1A1C',
  darkText: '#F2F2F2',
  darkMuted: '#9A9A9A',
  darkBorder: '#2A2A2C',
  darkAccent: '#8A73E8',
  darkAccentSoft: '#2A2546',
} as const;

export type ColorToken = keyof typeof colors;
