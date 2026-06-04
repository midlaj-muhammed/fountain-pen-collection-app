import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';

import { colors, type ColorToken } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space, type SpaceToken } from '@/design/tokens/spacing';

export type BoxProps = {
  children?: ReactNode;
  testID?: string | undefined;
  style?: StyleProp<ViewStyle> | undefined;

  /** Background color from the colors token map. */
  bg?: ColorToken;
  /** Foreground (used by some components for accents). */
  borderColor?: ColorToken;
  /** Corner radius from the radius token map. */
  radius?: keyof typeof radius;
  /** Padding (all sides) from the space token map. */
  p?: SpaceToken;
  /** Padding horizontal only. */
  px?: SpaceToken;
  /** Padding vertical only. */
  py?: SpaceToken;
  /** Margin (all sides) from the space token map. */
  m?: SpaceToken;
  /** Width = layout.contentWidth. */
  fullWidth?: boolean;
  /** Apply a thin border. */
  bordered?: boolean;
};

export function Box({
  children,
  testID,
  style,
  bg,
  borderColor,
  radius: r,
  p,
  px,
  py,
  m,
  fullWidth,
  bordered,
}: BoxProps) {
  const computed: ViewStyle = {};
  if (bg) computed.backgroundColor = colors[bg];
  if (borderColor) computed.borderColor = colors[borderColor];
  if (r) computed.borderRadius = radius[r];
  if (p) computed.padding = space[p];
  if (px !== undefined) {
    computed.paddingLeft = space[px];
    computed.paddingRight = space[px];
  }
  if (py !== undefined) {
    computed.paddingTop = space[py];
    computed.paddingBottom = space[py];
  }
  if (m !== undefined) computed.margin = space[m];
  if (fullWidth) computed.width = layout.contentWidth;
  if (bordered) {
    computed.borderWidth = 1;
    if (!borderColor) computed.borderColor = colors.border;
  }

  return (
    <View testID={testID} style={[computed, style]}>
      {children}
    </View>
  );
}
