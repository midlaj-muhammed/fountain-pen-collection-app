import { Image, StyleSheet, View } from 'react-native';

import { InkLevelDots } from '@/design/components/InkLevelDots/InkLevelDots';
import { InkSwatch } from '@/design/components/InkSwatch/InkSwatch';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import type { InkLevelPct } from '@/types/domain';

export type InkListItemData = {
  id: string;
  brand: string;
  name: string;
  colorHex: string;
  colorName: string;
  bottleSizeMl: number;
  currentLevelPct: InkLevelPct;
  isCartridge: boolean;
  photoURL?: string | null;
};

export type InkListItemProps = {
  ink: InkListItemData;
  onPress: () => void;
  testID?: string;
};

/**
 * 2-column grid ink card matching the Figma "Inks" screen.
 * Photo top, brand+name+swatch middle, ml + level dots bottom.
 */
export function InkListItem({ ink, onPress, testID }: InkListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ink.brand} ${ink.name}`}
      style={styles.card}
      testID={testID}
    >
      {ink.photoURL ? (
        <Image source={{ uri: ink.photoURL }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text color="textMuted" weight="600">
            {ink.brand[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}
      <Stack gap="xs" style={styles.body}>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {ink.brand}
        </Text>
        <Text variant="h3" numberOfLines={1}>
          {ink.name}
        </Text>
        <Stack axis="horizontal" align="center" gap="xs">
          <InkSwatch color={ink.colorHex} size={10} />
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {ink.colorName}
          </Text>
        </Stack>
      </Stack>
      <Stack
        axis="horizontal"
        align="center"
        justify="space-between"
        style={styles.footer}
      >
        <Text variant="caption" color="textMuted">
          {ink.bottleSizeMl} ml
        </Text>
        {!ink.isCartridge ? (
          <InkLevelDots level={ink.currentLevelPct} size={6} />
        ) : null}
      </Stack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flex: 1,
    gap: space.sm,
    padding: space.md,
  },
  footer: {
    marginTop: space.xs,
  },
  photo: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
    height: 80,
    width: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
