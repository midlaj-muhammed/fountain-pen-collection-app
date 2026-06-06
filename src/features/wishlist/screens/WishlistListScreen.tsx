/* eslint-disable react-native/no-raw-text */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Chip } from '@/design/components/Chip/Chip';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { FAB } from '@/design/components/FAB/FAB';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import {
  useDeleteWishlistItem,
  useUpdateWishlistItem,
  useWishlist,
} from '@/features/wishlist/api/queries';
import type { WishlistItem } from '@/types/domain';

export type WishlistListScreenProps = {
  uid: string | null;
  onAdd: () => void;
  testID?: string;
};

type Filter = 'all' | 'pen' | 'ink';

/**
 * "Wishlist" tab. Shows every entry on the user's wishlist, with a
 * chip filter to scope to pens / inks / all. Each row is a card
 * with a "Mark purchased" button (moves the item to the bottom
 * with a strike-through) and a "Remove" affordance that asks for
 * confirmation. Empty state and loading skeleton both match the
 * pattern used by Pens/Inks lists.
 */
export function WishlistListScreen({ uid, onAdd, testID }: WishlistListScreenProps) {
  const { data, isLoading } = useWishlist(uid);
  const update = useUpdateWishlistItem(uid);
  const remove = useDeleteWishlistItem(uid);
  const [filter, setFilter] = useState<Filter>('all');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader title="Wishlist" />
          <Stack gap="md">
            <Skeleton variant="row" />
            <Skeleton variant="row" />
            <Skeleton variant="row" />
          </Stack>
        </View>
      </SafeAreaView>
    );
  }

  const items = ((data ?? []) as WishlistItem[]).filter(
    (i: WishlistItem) => filter === 'all' || i.type === filter,
  );

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title="Wishlist" />
        <Stack gap="md" style={styles.bodyStack}>
          <View style={styles.chipsRow}>
            {(['all', 'pen', 'ink'] as const).map((f) => (
              <Chip
                key={f}
                label={f === 'all' ? 'All' : f === 'pen' ? 'Pens' : 'Inks'}
                active={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </View>

          {items.length === 0 ? (
            <EmptyState
              title="No items here yet"
              body="Add pens and inks you’re eyeing. Your wishlist stays private to you."
            />
          ) : (
            <Stack gap="sm">
              {items.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onMarkPurchased={() =>
                    update.mutate({
                      id: item.id,
                      patch: { notes: prependPurchased(item.notes) },
                    })
                  }
                  onRemove={() => {
                    Alert.alert(
                      'Remove from wishlist?',
                      `${item.brand} ${item.name} will be removed.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => remove.mutate(item.id),
                        },
                      ],
                    );
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </ScrollView>
      <FAB
        onPress={onAdd}
        accessibilityLabel="Add to wishlist"
        testID={`${testID}-fab`}
      />
    </SafeAreaView>
  );
}

function WishlistCard({
  item,
  onMarkPurchased,
  onRemove,
}: {
  item: WishlistItem;
  onMarkPurchased: () => void;
  onRemove: () => void;
}) {
  const purchased = item.notes?.startsWith('✓ Purchased') ?? false;
  return (
    <View style={styles.card}>
      <Stack gap="xs" style={styles.flex}>
        <View style={styles.cardHeader}>
          <Text
            variant="body"
            weight="600"
            style={purchased ? styles.struck : undefined}
          >
            {item.brand} {item.name}
          </Text>
          <Chip
            label={item.type === 'pen' ? 'Pen' : 'Ink'}
            active={false}
            onPress={() => {
              /* type is set on create; no toggle */
            }}
          />
        </View>
        {item.notes ? (
          <Text variant="small" color="textMuted">
            {item.notes}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {purchased ? null : (
            <ButtonS
              onPress={onMarkPurchased}
              variant="secondary"
              fullWidth={false}
              testID={`wishlist-purchased-${item.id}`}
            >
              Mark purchased
            </ButtonS>
          )}
          <Pressable
            onPress={onRemove}
            testID={`wishlist-remove-${item.id}`}
            style={styles.removeBtn}
          >
            <Text variant="small" color="danger" weight="600">
              Remove
            </Text>
          </Pressable>
        </View>
      </Stack>
    </View>
  );
}

function prependPurchased(notes: string | undefined): string {
  const tag = '✓ Purchased';
  if (!notes) return tag;
  if (notes.startsWith(tag)) return notes;
  return `${tag} — ${notes}`;
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.xs,
  },
  body: {
    padding: space.lg,
  },
  bodyStack: {
    marginTop: space.md,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  flex: { flex: 1 },
  removeBtn: {
    paddingVertical: space.xs,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
});
