import { StyleSheet } from 'react-native';

import { Pressable } from '@/design/primitives/Pressable';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type ChipProps = {
  label: string;
  active?: boolean | undefined;
  onPress: () => void;
  testID?: string | undefined;
};

/**
 * Pill toggle used for "Bottles" / "Cartridges" tabs and filter chips.
 * Active = filled violet; inactive = outline gray.
 */
export function Chip({ label, active, onPress, testID }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      testID={testID}
      style={[
        styles.chip,
        active
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : // eslint-disable-next-line react-native/no-color-literals
            { backgroundColor: 'transparent', borderColor: colors.border },
      ]}
    >
      <Text
        variant="small"
        weight="600"
        color={active ? 'textInverse' : 'text'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
});
