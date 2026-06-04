import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { colors, type ColorToken } from '@/design/tokens/colors';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  color: (token: ColorToken) => string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  theme?: Theme;
};

/**
 * Provides the current color palette. In P1.1 this becomes a full
 * light/dark switcher with system-preference detection and a persistence layer
 * (Firestore + MMKV). For P0 it just returns the requested theme.
 */
export function ThemeProvider({ children, theme = 'light' }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    const palette = theme === 'dark' ? darkPalette() : lightPalette();
    return {
      theme,
      color: (token) => palette[token] ?? colors[token],
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

// Until P1.1 we resolve dark tokens from the `dark*` keys of `colors`.
// This is intentionally simple — the real switcher will live in
// src/design/theme/{light,dark}.ts.
function lightPalette(): Partial<Record<ColorToken, string>> {
  return {};
}

function darkPalette(): Partial<Record<ColorToken, string>> {
  return {
    primary: colors.darkText,
    text: colors.darkText,
    textMuted: colors.darkMuted,
    bg: colors.darkBg,
    bgElevated: colors.darkSurface,
    border: colors.darkBorder,
    accent: colors.darkAccent,
    accentSoft: colors.darkAccentSoft,
  };
}
