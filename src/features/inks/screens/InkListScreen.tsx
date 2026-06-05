/* eslint-disable react-native/no-raw-text */
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Chip } from '@/design/components/Chip/Chip';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { FAB } from '@/design/components/FAB/FAB';
import { InkListItem, type InkListItemData } from '@/design/components/InkListItem/InkListItem';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import type { Ink } from '@/types/domain';

export type InkListScreenProps = {
  uid: string | null;
  onAddInk: () => void;
  onOpenInk: (inkId: string) => void;
  testID?: string;
};

type ViewMode = 'bottles' | 'cartridges';

/**
 * "My Inks" list. 2-column grid matching the Figma "Inks" screen. A
 * Bottles / Cartridges chip toggle filters what we render. The empty
 * state respects the active filter (different prompts).
 */
export function InkListScreen({ uid, onAddInk, onOpenInk, testID }: InkListScreenProps) {
  const { data, isLoading } = useInks(uid);
  const [mode, setMode] = useState<ViewMode>('bottles');

  const items = useMemo<InkListItemData[]>(() => {
    if (!data) return [];
    return data
      .filter((i: Ink) => (mode === 'bottles' ? !i.isCartridge : i.isCartridge))
      .map((i: Ink) => ({
        id: i.id,
        brand: i.brand,
        name: i.name,
        colorHex: i.colorHex,
        colorName: i.colorName,
        bottleSizeMl: i.bottleSizeMl,
        currentLevelPct: i.currentLevelPct,
        isCartridge: i.isCartridge,
        photoURL: i.photoURL,
      }));
  }, [data, mode]);

  const totalCount = data?.length ?? 0;
  const otherModeCount = useMemo(
    () => (data ? data.filter((i: Ink) => (mode === 'bottles' ? i.isCartridge : !i.isCartridge)).length : 0),
    [data, mode],
  );

  if (isLoading) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="My Inks" />
        <Stack gap="md" style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </Stack>
      </View>
    );
  }

  if (totalCount === 0) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="My Inks" />
        <EmptyState
          title="No inks yet"
          body="Add your first ink to start tracking your collection."
          action={{ label: 'Add ink', onPress: onAddInk }}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <SectionHeader
        title="My Inks"
        right={
          <ButtonS onPress={onAddInk} variant="secondary" size="sm">
            Add new
          </ButtonS>
        }
      />
      <Stack axis="horizontal" gap="sm" style={styles.toggleRow}>
        <Chip
          label="Bottles"
          active={mode === 'bottles'}
          onPress={() => setMode('bottles')}
          testID={`${testID}-toggle-bottles`}
        />
        <Chip
          label="Cartridges"
          active={mode === 'cartridges'}
          onPress={() => setMode('cartridges')}
          testID={`${testID}-toggle-cartridges`}
        />
      </Stack>
      {items.length === 0 ? (
        <EmptyState
          title={mode === 'bottles' ? 'No bottles yet' : 'No cartridges yet'}
          body={
            mode === 'bottles'
              ? 'Add a bottle ink to track its level over time.'
              : 'Add a cartridge ink to your collection.'
          }
          action={{ label: 'Add ink', onPress: onAddInk }}
        />
      ) : (
        <View style={styles.grid}>
          {items.map((ink) => (
            <View key={ink.id} style={styles.gridCell}>
              <InkListItem ink={ink} onPress={() => onOpenInk(ink.id)} />
            </View>
          ))}
        </View>
      )}
      {/* Avoid unused-var warning; surfaces count to a11y label updates later. */}
      <View accessibilityElementsHidden importantForAccessibility="no">
        <ButtonS onPress={() => undefined} disabled>
          {`${otherModeCount} in other`}
        </ButtonS>
      </View>
      <FAB
        onPress={onAddInk}
        accessibilityLabel="Add ink"
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  fab: {
    bottom: space.xl,
    position: 'absolute',
    right: space.lg,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  gridCell: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  toggleRow: {
    paddingHorizontal: space.lg,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
