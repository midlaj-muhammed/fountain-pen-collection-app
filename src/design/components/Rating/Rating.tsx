import { StyleSheet, View } from 'react-native';

import { Pressable } from '@/design/primitives/Pressable';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';

export type RatingProps = {
  /** 0–5. */
  value: number;
  /** When provided, the rating becomes tappable. */
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  testID?: string;
  accessibilityLabel?: string;
};

/**
 * 5-star rating. Read-only by default; pass `onChange` to make it interactive.
 * 24pt stars by default; pass `size` to scale.
 */
export function Rating({ value, onChange, size = 24, testID, accessibilityLabel }: RatingProps) {
  const stars = [1, 2, 3, 4, 5] as const;
  return (
    <View
      testID={testID}
      accessibilityRole={onChange ? 'adjustable' : 'image'}
      accessibilityLabel={accessibilityLabel ?? `Rating: ${value} of 5`}
      accessibilityValue={{ min: 0, max: 5, now: value }}
      style={styles.row}
    >
      {stars.map((n) => {
        const filled = n <= value;
        const star = (
          <Text
            key={n}
            color={filled ? 'star' : 'starEmpty'}
            weight="700"
            style={{ fontSize: size, lineHeight: size + 4 }}
          >
            {filled ? '★' : '☆'}
          </Text>
        );
        if (!onChange) {
          return (
            <View key={n} testID={`star-${n}`}>
              {star}
            </View>
          );
        }
        return (
          <Pressable
            key={n}
            testID={`star-${n}`}
            onPress={() => onChange(n)}
            accessibilityLabel={`Set rating to ${n}`}
            accessibilityRole="button"
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

// Color is referenced through Text's `color` prop; this is here only to keep
// the design-system surface in one place if we ever need to read these
// programmatically (e.g. for Storybook).
export const _ratingColors = colors;
