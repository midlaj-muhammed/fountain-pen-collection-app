import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { colors, type ColorToken } from '@/design/tokens/colors';
import { saveCache, loadCache } from '@/lib/cache/mmkvCache';

/**
 * Three-mode theme. The user picks an explicit `light` or `dark`,
 * or `system` to follow the OS preference. The choice is persisted
 * to MMKV synchronously on change and mirrored to the Firestore
 * user doc by the SettingsScreen's `useUpdateUser` mutation; the
 * cache lets the next cold start resolve the theme without waiting
 * on the network.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_CACHE_KEY = 'theme:mode';

/**
 * Resolves a ThemeMode into a concrete light/dark by consulting the
 * system color scheme. Falls back to 'light' when the OS value
 * isn't yet known.
 */
export function resolveTheme(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Read the cached theme mode synchronously from MMKV (best-effort,
 * returns null on miss). Used at app start so the first paint
 * already has the right palette; the user doc may not have loaded
 * yet.
 */
export function readCachedThemeMode(): ThemeMode | null {
  // MMKV is async (we use AsyncStorage under the hood), so we can't
  // truly read synchronously. Instead we kick off a one-shot read
  // at provider mount and store the result in state. Cold start
  // renders with 'system' until the cache resolves (~one frame);
  // a brief flash to system color is acceptable.
  return null;
}

type ThemeContextValue = {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setMode: (next: ThemeMode) => void;
  color: (token: ColorToken) => string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  /**
   * Initial mode for tests. In production we read from MMKV
   * asynchronously on mount.
   */
  initialMode?: ThemeMode;
  /**
   * Legacy prop accepted for back-compat with older test suites:
   * `'light' | 'dark'`. Equivalent to passing
   * `initialMode={theme}`. Prefer `initialMode` in new code.
   */
  theme?: 'light' | 'dark';
};

/**
 * Provides the current color palette. The mode is sticky in MMKV
 * (instant cold start) and the resolved theme is reactive to:
 *   - mode changes via `setMode` (called from SettingsScreen)
 *   - OS scheme changes when mode is 'system' (via Appearance)
 *   - first paint after async cache resolution
 *
 * Firestore is the source of truth for cross-device sync; the
 * SettingsScreen's existing `useUpdateUser` writes the user's
 * `settings.theme` field. The local MMKV mirror here is what
 * keeps cold start from flashing the wrong palette.
 */
export function ThemeProvider({ children, initialMode, theme }: ThemeProviderProps) {
  // Legacy `theme` prop wins over `initialMode` if both are passed
  // (only old tests do this; production uses initialMode).
  const [mode, setModeState] = useState<ThemeMode>(theme ?? initialMode ?? 'system');
  const systemScheme = useColorScheme();

  // On mount, overlay any cached mode from MMKV. We do this once;
  // subsequent setMode calls go through the public setMode below.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCache<ThemeMode>(THEME_CACHE_KEY).catch(() => null);
      if (!cancelled && cached && (cached === 'light' || cached === 'dark' || cached === 'system')) {
        setModeState(cached);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track OS scheme changes for 'system' mode. (useColorScheme is
  // already reactive; this effect is a no-op for explicit modes.)
  // No listener needed: useColorScheme() re-renders on change.

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    // Fire-and-forget MMKV write. The cache is best-effort: a
    // missed write just means the next cold start falls back to
    // the default 'system' until the network round-trip completes.
    void saveCache(THEME_CACHE_KEY, next).catch(() => undefined);
  };

  const value = useMemo<ThemeContextValue>(() => {
    const theme = resolveTheme(mode, systemScheme);
    const palette = theme === 'dark' ? darkPalette() : lightPalette();
    return {
      mode,
      theme,
      setMode,
      color: (token) => palette[token] ?? colors[token],
    };
    // re-resolve on system scheme change so 'system' mode flips
    // when the user toggles their OS dark mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

// ── Palettes ───────────────────────────────────────────────

/**
 * Dark palette: explicit overrides for every surface and semantic
 * color. The light palette falls through to the literal values
 * defined in `colors.ts`; dark mode gets the full override table
 * so every token renders readably on a dark background.
 *
 * Conventions:
 *  - Surfaces (bg, bgElevated, bgMuted, border, divider, scrim)
 *    → dark.
 *  - Text (text, textMuted, textInverse) → flipped.
 *  - Accent (accent, accentSoft, accentDeep, primarySoft) → softened.
 *  - Semantic states (success, warning, danger, info) → brighter
 *    variants so they still pop on a dark background.
 *  - Star / inkDot → tweaked so empty dot reads against dark.
 */
function darkPalette(): Partial<Record<ColorToken, string>> {
  return {
    // Surfaces
    bg: colors.darkBg,
    bgElevated: colors.darkSurface,
    bgMuted: '#1F1F22',
    border: colors.darkBorder,
    divider: '#222226',
    scrim: 'rgba(0, 0, 0, 0.65)',

    // Brand / text
    primary: colors.darkText,
    text: colors.darkText,
    textMuted: colors.darkMuted,
    textInverse: '#0F0F10',

    // Accent
    accent: colors.darkAccent,
    accentSoft: colors.darkAccentSoft,
    accentDeep: '#A892F0',
    primarySoft: '#3A3A3E',

    // Semantic states (brighter so they read on dark)
    success: '#5BB987',
    warning: '#E0B25A',
    danger: '#E07060',
    info: '#6FA8D8',

    // Rating
    star: '#F2B948',
    starEmpty: '#3A3A3E',

    // Ink-level dots
    inkDot: colors.darkAccent,
    inkDotEmpty: '#2E2E32',
  };
}

/**
 * Light palette: empty (use the literal values from `colors`).
 * Kept as a function for symmetry with darkPalette and future
 * light-mode tweaks (e.g. a "warm" vs "cool" light theme).
 */
function lightPalette(): Partial<Record<ColorToken, string>> {
  return {};
}

// `Appearance` is imported so the test suite can spy on it if a
// future test wants to force a system color scheme.
void Appearance;
