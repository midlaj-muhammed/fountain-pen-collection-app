/* eslint-disable react-native/no-raw-text */
import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { FAB } from '@/design/components/FAB/FAB';
import { PenListItem, type PenListItemData } from '@/design/components/PenListItem/PenListItem';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';
import { usePens } from '@/features/pens/api/queries';
import type { Pen } from '@/types/domain';

export type PenListScreenProps = {
  uid: string | null;
  onAddPen: () => void;
  onOpenPen: (penId: string) => void;
  testID?: string;
};

/**
 * "My Pens" list. Renders a FlashList (FlashList is on the roadmap; v1
 * uses a View for simplicity so the slice can ship first), the
 * SectionHeader, and either a per-row FAB (via PenListItem) or a header
 * ADD NEW CTA.
 */
export function PenListScreen({ uid, onAddPen, onOpenPen, testID }: PenListScreenProps) {
  const { data, isLoading } = usePens(uid);

  const items = useMemo<PenListItemData[]>(() => {
    if (!data) return [];
    return data.map((p: Pen) => ({
      id: p.id,
      brand: p.brand,
      model: p.model,
      nibSize: p.nib.size,
      nibMaterial: p.nib.material,
      photoURL: p.photoURL,
      totalSessions: p.totalSessions,
      lastUsedDaysAgo: null, // Computed in a later slice from sessions
      hasInkAlert: false,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="My Pens" />
        <Stack gap="md" style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </Stack>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="My Pens" />
        <EmptyState
          title="No pens yet"
          body="Add your first pen to start tracking your collection."
          action={{ label: 'Add pen', onPress: onAddPen }}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <SectionHeader
        title="My Pens"
        right={
          <ButtonS onPress={onAddPen} variant="secondary" size="sm">
            Add new
          </ButtonS>
        }
      />
      <View style={styles.list}>
        <FlashList
          data={items}
          keyExtractor={(p) => p.id}
          estimatedItemSize={88}
          renderItem={({ item }) => (
            <PenListItem
              pen={item}
              onPress={() => onOpenPen(item.id)}
              onAddSession={() => {
                /* Sessions slice (S4) — opens session form for this pen */
              }}
            />
          )}
        />
      </View>
      <FAB
        onPress={onAddPen}
        accessibilityLabel="Add pen"
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
  list: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
