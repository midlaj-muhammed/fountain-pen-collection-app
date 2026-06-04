import { StyleSheet, View } from 'react-native';

import { colors } from '@/design/tokens/colors';
import type { InkLevelPct } from '@/types/domain';

export type InkLevelDotsProps = {
  level: InkLevelPct;
  size?: number;
  testID?: string;
  accessibilityLabel?: string;
};

const STEPS = 5;

/**
 * 5-dot level indicator matching the Figma ink-screen design.
 *   0%   → 0 filled
 *   20%  → 1 filled
 *   40%  → 2 filled
 *   60%  → 3 filled
 *   80%  → 4 filled
 *   100% → 5 filled
 */
export function InkLevelDots({
  level,
  size = 8,
  testID,
  accessibilityLabel,
}: InkLevelDotsProps) {
  const filled = Math.round(level / (100 / STEPS));
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? `Ink level ${level}%`}
      accessibilityRole="image"
      style={styles.row}
    >
      {Array.from({ length: STEPS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: i < filled ? colors.inkDot : colors.inkDotEmpty,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {},
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
