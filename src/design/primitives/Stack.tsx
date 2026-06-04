import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';

import { space, type SpaceToken } from '@/design/tokens/spacing';

export type StackAxis = 'vertical' | 'horizontal';

export type StackProps = {
  children?: ReactNode;
  testID?: string | undefined;
  style?: StyleProp<ViewStyle> | undefined;

  /** 'vertical' (default) or 'horizontal'. */
  axis?: StackAxis;
  /** Gap between children, from the space token map. */
  gap?: SpaceToken;
  /** Align items on the cross axis. */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Justify content on the main axis. */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
};

export function Stack({
  children,
  testID,
  style,
  axis = 'vertical',
  gap,
  align,
  justify,
}: StackProps) {
  const computed: ViewStyle = {
    flexDirection: axis === 'horizontal' ? 'row' : 'column',
  };
  if (gap !== undefined) computed.gap = space[gap];
  if (align) computed.alignItems = align;
  if (justify) computed.justifyContent = justify;

  return (
    <View testID={testID} style={[computed, style]}>
      {children}
    </View>
  );
}
