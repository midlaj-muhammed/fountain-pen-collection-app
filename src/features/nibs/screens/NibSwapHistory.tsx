/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { FAB } from '@/design/components/FAB/FAB';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useNibSwaps } from '@/features/nibs/api/queries';
import type { NibSwap } from '@/types/domain';

export type NibSwapHistoryProps = {
  uid: string | null;
  penId: string;
  onAddSwap: () => void;
  onBack: () => void;
  testID?: string;
};

/**
 * Nib-swap history for a single pen. Lists swaps newest-first; FAB
 * opens the NibSwapForm. Each row shows the from→to nib summary plus
 * the date and any notes.
 */
export function NibSwapHistory({ uid, penId, onAddSwap, onBack, testID }: NibSwapHistoryProps) {
  const { data: swaps, isLoading } = useNibSwaps(uid, penId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader title="Nib history" />
          <Stack gap="sm">
            <Skeleton variant="row" />
            <Skeleton variant="row" />
          </Stack>
        </View>
      </SafeAreaView>
    );
  }

  if (!swaps || swaps.length === 0) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader
            title="Nib history"
            right={
              <ButtonS onPress={onBack} variant="ghost" size="sm">
                Back
              </ButtonS>
            }
          />
          <EmptyState
            title="No nib swaps yet"
            body="Record a swap whenever you change a pen's nib."
            action={{ label: 'Record a swap', onPress: onAddSwap }}
          />
          <FAB
            onPress={onAddSwap}
            accessibilityLabel="Add nib swap"
            style={styles.fab}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader
          title="Nib history"
          right={
            <ButtonS onPress={onBack} variant="ghost" size="sm">
              Back
            </ButtonS>
          }
        />
        <Stack gap="sm" style={styles.list}>
          {swaps.map((s: NibSwap) => (
            <SwapRow key={s.id} swap={s} />
          ))}
        </Stack>
      </ScrollView>
      <FAB
        onPress={onAddSwap}
        accessibilityLabel="Add nib swap"
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

function SwapRow({ swap }: { swap: NibSwap }) {
  return (
    <Pressable accessibilityRole="button" style={styles.row}>
      <Stack gap="xs" style={styles.flex}>
        <Text variant="body" weight="600">
          {formatNib(swap.fromNib)} → {formatNib(swap.toNib)}
        </Text>
        <Text variant="small" color="textMuted">
          {formatDate(swap.date)}
        </Text>
        {swap.notes ? (
          <Text variant="small" color="textMuted">
            {swap.notes}
          </Text>
        ) : null}
      </Stack>
    </Pressable>
  );
}

function formatNib(nib: { size: string; material: string; customLabel?: string | null }): string {
  return `${nib.size} · ${nib.material}`;
}

function formatDate(d: { toDate?: () => Date; seconds?: number } | Date): string {
  if (d instanceof Date) return d.toLocaleDateString();
  if (typeof d.toDate === 'function') return d.toDate().toLocaleDateString();
  if (typeof d.seconds === 'number') return new Date(d.seconds * 1000).toLocaleDateString();
  return '';
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
  flex: {
    flex: 1,
  },
  list: {
    marginTop: space.sm,
  },
  row: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.md,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
