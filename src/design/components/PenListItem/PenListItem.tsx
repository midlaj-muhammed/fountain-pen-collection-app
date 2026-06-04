import { Image, StyleSheet, View } from 'react-native';

import { FAB } from '@/design/components/FAB/FAB';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import type { NibMaterial, NibSize } from '@/types/domain';

export type PenListItemData = {
  id: string;
  brand: string;
  model: string;
  nibSize: NibSize;
  nibMaterial?: NibMaterial;
  photoURL?: string | null;
  totalSessions: number;
  /** Convenience: pass `lastUsedDaysAgo` or null. */
  lastUsedDaysAgo: number | null;
  hasInkAlert?: boolean;
};

export type PenListItemProps = {
  pen: PenListItemData;
  onPress: () => void;
  onAddSession?: () => void;
  testID?: string;
};

/**
 * Single-column pen card matching the Figma "Pens" screen.
 * 345w (full content width) × ~96h. Photo left, meta middle, FAB right.
 */
export function PenListItem({ pen, onPress, onAddSession, testID }: PenListItemProps) {
  return (
    <View style={styles.card} testID={testID}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${pen.brand} ${pen.model}`}
        style={styles.row}
      >
        {pen.photoURL ? (
          <Image source={{ uri: pen.photoURL }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text color="textMuted" weight="600">
              {pen.brand[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Stack flex={1} style={styles.meta} gap="xs">
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {pen.brand}
          </Text>
          <Text variant="h3" numberOfLines={1}>
            {pen.model}
          </Text>
          <Text variant="caption" color="textMuted">
            {pen.lastUsedDaysAgo === null
              ? 'Not used yet'
              : pen.lastUsedDaysAgo === 0
                ? 'Last used today'
                : pen.lastUsedDaysAgo === 1
                  ? 'Last used 1 day ago'
                  : `Last used ${pen.lastUsedDaysAgo} days ago`}
          </Text>
        </Stack>
        <Stack align="center" gap="xs" style={styles.right}>
          <Stack axis="horizontal" align="center" gap="xs">
            <Text variant="caption" color="textMuted">
              {pen.totalSessions}
            </Text>
            <Text variant="caption" color="textMuted">
              {pen.nibSize}
            </Text>
          </Stack>
          {onAddSession ? (
            <FAB
              onPress={onAddSession}
              accessibilityLabel={`Add session for ${pen.brand} ${pen.model}`}
              size={36}
            />
          ) : null}
        </Stack>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    marginBottom: space.md,
    padding: space.md,
    width: layout.contentWidth,
  },
  meta: {
    flex: 1,
  },
  photo: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    height: 64,
    width: 64,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    minWidth: 56,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
  },
});
