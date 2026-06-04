import { type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

import { Pressable } from '@/design/primitives/Pressable';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';

export type FABProps = {
  onPress: () => void;
  icon?: ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
  testID?: string | undefined;
  style?: ViewStyle | undefined;
};

/**
 * 44pt filled violet circle. Used both as a global FAB and per-row in
 * the Pens list ("+" on each card).
 */
export function FAB({ onPress, icon, accessibilityLabel, accessibilityHint, testID, style }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      testID={testID}
      style={[styles.fab, style]}
    >
      {icon ?? <Text color="textInverse" weight="700">+</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
