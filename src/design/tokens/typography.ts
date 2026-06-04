import { Platform } from 'react-native';

/**
 * Typography tokens.
 *
 * `display` and the various `h*` levels are for big, bold, often violet
 * titles on screens (e.g. "My Pens", "My ink bottles", "Calendar").
 * `body` and `bodyBold` are the workhorses for content.
 * `small` and `caption` are for metadata ("Last used 2 days ago", ml count).
 * `numeric` is for stats — slightly larger and tighter.
 * `button` is for primary CTA labels (uppercase with letter-spacing —
 * matches Figma "ADD NEW" / "ADD EVENT" buttons).
 */
export type TypeStyle = {
  size: number;
  lineHeight: number;
  weight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
};

export const type = {
  fontSans: Platform.select({ ios: 'System', android: 'Roboto' }) ?? 'System',
  // Optional serif for big titles — gives a subtle "notebook" feel.
  fontSerif: Platform.select({ ios: 'Georgia', android: 'serif' }) ?? 'Georgia',

  display: { size: 32, lineHeight: 40, weight: '700' },
  h1: { size: 28, lineHeight: 36, weight: '700' },
  h2: { size: 20, lineHeight: 28, weight: '600' },
  h3: { size: 17, lineHeight: 24, weight: '600' },
  body: { size: 16, lineHeight: 24, weight: '400' },
  bodyBold: { size: 16, lineHeight: 24, weight: '600' },
  small: { size: 13, lineHeight: 18, weight: '400' },
  caption: { size: 11, lineHeight: 14, weight: '500' },
  numeric: { size: 28, lineHeight: 32, weight: '700' },
  button: { size: 14, lineHeight: 20, weight: '700', letterSpacing: 0.5 },
} as const;
