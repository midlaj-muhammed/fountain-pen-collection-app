import { type ReactNode } from 'react';
import { type StyleProp, type TextStyle, Text as RNText } from 'react-native';

import { colors, type ColorToken } from '@/design/tokens/colors';
import { type, type TypeStyle } from '@/design/tokens/typography';

export type TextVariant = keyof Omit<typeof type, 'fontSans' | 'fontSerif'>;

export type TextProps = {
  children?: ReactNode;
  testID?: string | undefined;
  style?: StyleProp<TextStyle> | undefined;

  /** Type scale entry. Default: 'body'. */
  variant?: TextVariant;
  /** Foreground color from the colors token map. */
  color?: ColorToken;
  /** Center-align text. */
  center?: boolean;
  /** Uppercase transform — used for primary CTA labels (ADD NEW, ADD EVENT). */
  uppercased?: boolean;
  /** Override the weight without changing the variant size. */
  weight?: TypeStyle['weight'];
  /** Number of lines to clamp to (0 = unlimited). */
  numberOfLines?: number;
};

export function Text({
  children,
  testID,
  style,
  variant = 'body',
  color,
  center,
  uppercased,
  weight,
  numberOfLines,
}: TextProps) {
  const v = type[variant] as TypeStyle;
  const computed: TextStyle = {
    color: color ? colors[color] : colors.text,
    fontSize: v.size,
    lineHeight: v.lineHeight,
    fontWeight: v.weight,
  };
  if (v.letterSpacing !== undefined) computed.letterSpacing = v.letterSpacing;
  if (weight) computed.fontWeight = weight;
  if (center) computed.textAlign = 'center';
  if (uppercased) computed.textTransform = 'uppercase';

  return (
    <RNText testID={testID} style={[computed, style]} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );
}
