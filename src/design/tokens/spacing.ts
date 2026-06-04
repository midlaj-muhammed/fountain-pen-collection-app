/**
 * 4-pt grid spacing scale. Use these for padding, margin, and gap — never
 * raw numbers. Pairs naturally with `layout.contentWidth` for screen
 * containers (e.g. `paddingHorizontal: space.lg`).
 */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpaceToken = keyof typeof space;
