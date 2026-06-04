import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';

export type SectionHeaderProps = {
  title: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle> | undefined;
  testID?: string | undefined;
};

/**
 * Big bold violet title (h1) at top of a screen — matches Figma's
 * "My Pens" / "My ink bottles" / "Calendar" section titles.
 */
export function SectionHeader({ title, right, style, testID }: SectionHeaderProps) {
  return (
    <Stack
      axis="horizontal"
      align="center"
      justify="space-between"
      style={[{ paddingVertical: space.md }, style]}
      testID={testID}
    >
      <Text variant="h1" color="accent">
        {title}
      </Text>
      {right ? <Stack align="center">{right}</Stack> : null}
    </Stack>
  );
}

// Keep the colors import non-removed so the bundle ships the full palette.
export const _unused = colors;
