import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type SkeletonProps = {
  variant?: 'row' | 'text';
  lines?: number;
  testID?: string;
};

/**
 * Lightweight loading placeholder. No actual shimmer animation in MVP —
 * a flat gray block is enough until perf requires it.
 */
export function Skeleton({ variant = 'text', lines = 3, testID }: SkeletonProps): ReactNode {
  if (variant === 'row') {
    return (
      <View testID={testID} style={styles.row}>
        <View style={[styles.block, styles.avatar]} />
        <View style={styles.col}>
          <View style={[styles.block, styles.line, { width: '60%' }]} />
          <View style={[styles.block, styles.line, { width: '40%' }]} />
        </View>
      </View>
    );
  }
  return (
    <View testID={testID} style={styles.col}>
      {Array.from({ length: lines }, (_, i) => (
        <View
          key={i}
          style={[styles.block, styles.line, { width: i === lines - 1 ? '60%' : '90%' }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radius.md,
    height: 64,
    width: 64,
  },
  block: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
  },
  col: {
    flex: 1,
    gap: space.sm,
  },
  line: {
    height: 14,
  },
  row: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
});
