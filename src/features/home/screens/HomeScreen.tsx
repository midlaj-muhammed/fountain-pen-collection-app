/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { InkLevelDots } from '@/design/components/InkLevelDots/InkLevelDots';
import { InkSwatch } from '@/design/components/InkSwatch/InkSwatch';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import type { Ink, Pen } from '@/types/domain';

const RECENT_CAP = 3;
const LOW_LEVEL_THRESHOLD = 20;

export type HomeScreenProps = {
  uid: string | null;
  onOpenPen: (penId: string) => void;
  onOpenInk: (inkId: string) => void;
  onSeeAllPens: () => void;
  onSeeAllInks: () => void;
  onAddPen: () => void;
  onAddInk: () => void;
  testID?: string;
};

/**
 * "Home" dashboard — the first screen of the Pens tab. Sections:
 *   1. Greeting + "Today" (sessions logged today — wired in S4)
 *   2. Recent pens (last 3)  with an inline "Add pen" CTA
 *   3. Recent inks (last 3)  with an inline "Add ink" CTA
 *   4. Low-ink alert (any bottle ink with level <= 20)
 *
 * The "Add pen / Add ink" CTA is always visible — the user shouldn't
 * have to tap "See all" → land on the list → find the FAB to add
 * their first pen. When the lists are empty, the CTA also lives in
 * the empty-state row.
 */
export function HomeScreen({
  uid,
  onOpenPen,
  onOpenInk,
  onSeeAllPens,
  onSeeAllInks,
  onAddPen,
  onAddInk,
  testID,
}: HomeScreenProps) {
  const { data: pens, isLoading: pensLoading } = usePens(uid);
  const { data: inks, isLoading: inksLoading } = useInks(uid);

  const recentPens = useMemo<Pen[]>(() => (pens ? pens.slice(0, RECENT_CAP) : []), [pens]);
  const recentInks = useMemo<Ink[]>(() => (inks ? inks.slice(0, RECENT_CAP) : []), [inks]);
  const lowInks = useMemo<Ink[]>(
    () =>
      inks
        ? inks.filter((i: Ink) => !i.isCartridge && i.currentLevelPct <= LOW_LEVEL_THRESHOLD)
        : [],
    [inks],
  );
  const hasMorePens = (pens?.length ?? 0) > RECENT_CAP;
  const hasMoreInks = (inks?.length ?? 0) > RECENT_CAP;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.body}
      testID={testID}
      keyboardShouldPersistTaps="handled"
    >
      <Stack flex={1} gap="lg">
        <Stack gap="xs" testID={`${testID}-greeting`}>
          <Text variant="caption" color="textMuted">
            {today}
          </Text>
          <Text variant="h1" color="accent">
            My Pen
          </Text>
        </Stack>

        <Stack gap="sm">
          <SectionHeader title="Today" />
          <View style={styles.statCard}>
            <Text variant="small" color="textMuted">
              Sessions logged today
            </Text>
            <Text variant="h2" color="accent">
              0
            </Text>
            <Text variant="caption" color="textMuted">
              Quick log from the bottom card → counts will appear here (S4).
            </Text>
          </View>
        </Stack>

        {lowInks.length > 0 ? (
          <Stack gap="sm">
            <SectionHeader title="Ink running low" />
            <Stack gap="sm">
              {lowInks.map((i) => (
                <LowInkRow
                  key={i.id}
                  ink={i}
                  onPress={() => onOpenInk(i.id)}
                  testID={`${testID}-low-ink-${i.id}`}
                />
              ))}
            </Stack>
          </Stack>
        ) : null}

        <Stack gap="sm">
          <SectionHeader
            title="Recent pens"
            right={
              <Pressable
                onPress={onAddPen}
                accessibilityRole="button"
                accessibilityLabel="Add pen"
                testID={`${testID}-add-pen`}
              >
                <Text variant="small" weight="600" color="accent">
                  + Add pen
                </Text>
              </Pressable>
            }
          />
          {hasMorePens ? (
            <Pressable
              onPress={onSeeAllPens}
              accessibilityRole="link"
              testID={`${testID}-pens-see-all`}
            >
              <Text variant="caption" color="textMuted">
                Showing {RECENT_CAP} of {pens?.length ?? 0}.{' '}
                <Text variant="caption" weight="600" color="accent">
                  See all →
                </Text>
              </Text>
            </Pressable>
          ) : null}
          {pensLoading ? (
            <Stack gap="sm">
              <Skeleton variant="row" />
              <Skeleton variant="row" />
            </Stack>
          ) : recentPens.length === 0 ? (
            <EmptyPenRow onAddPen={onAddPen} />
          ) : (
            <Stack gap="sm">
              {recentPens.map((p) => (
                <RecentPenRow
                  key={p.id}
                  pen={p}
                  onPress={() => onOpenPen(p.id)}
                />
              ))}
            </Stack>
          )}
        </Stack>

        <Stack gap="sm">
          <SectionHeader
            title="Recent inks"
            right={
              <Pressable
                onPress={onAddInk}
                accessibilityRole="button"
                accessibilityLabel="Add ink"
                testID={`${testID}-add-ink`}
              >
                <Text variant="small" weight="600" color="accent">
                  + Add ink
                </Text>
              </Pressable>
            }
          />
          {hasMoreInks ? (
            <Pressable
              onPress={onSeeAllInks}
              accessibilityRole="link"
              testID={`${testID}-inks-see-all`}
            >
              <Text variant="caption" color="textMuted">
                Showing {RECENT_CAP} of {inks?.length ?? 0}.{' '}
                <Text variant="caption" weight="600" color="accent">
                  See all →
                </Text>
              </Text>
            </Pressable>
          ) : null}
          {inksLoading ? (
            <Stack gap="sm">
              <Skeleton variant="row" />
              <Skeleton variant="row" />
            </Stack>
          ) : recentInks.length === 0 ? (
            <EmptyInkRow onAddInk={onAddInk} />
          ) : (
            <Stack gap="sm">
              {recentInks.map((i) => (
                <RecentInkRow key={i.id} ink={i} onPress={() => onOpenInk(i.id)} />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </ScrollView>
  );
}

function RecentPenRow({ pen, onPress }: { pen: Pen; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pen.brand} ${pen.model}`}
      style={styles.row}
    >
      {pen.photoURL ? (
        <Image source={{ uri: pen.photoURL }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text weight="700">{pen.brand[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}
      <Stack gap="xs" style={styles.flex}>
        <Text variant="caption" color="textMuted">
          {pen.brand}
        </Text>
        <Text variant="body" weight="600" numberOfLines={1}>
          {pen.model}
        </Text>
        <Text variant="small" color="textMuted">
          {pen.nib.size} · {pen.nib.material}
        </Text>
      </Stack>
    </Pressable>
  );
}

function RecentInkRow({ ink, onPress }: { ink: Ink; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ink.brand} ${ink.name}`}
      style={styles.row}
    >
      <View style={[styles.thumb, { backgroundColor: ink.colorHex }]}>
        <Text color="textInverse" weight="700">
          {ink.brand[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <Stack gap="xs" style={styles.flex}>
        <Text variant="caption" color="textMuted">
          {ink.brand}
        </Text>
        <Text variant="body" weight="600" numberOfLines={1}>
          {ink.name}
        </Text>
        <Stack axis="horizontal" align="center" gap="xs">
          <InkSwatch color={ink.colorHex} size={8} />
          <Text variant="small" color="textMuted" numberOfLines={1}>
            {ink.colorName}
          </Text>
        </Stack>
      </Stack>
      {!ink.isCartridge ? (
        <InkLevelDots level={ink.currentLevelPct} size={6} />
      ) : null}
    </Pressable>
  );
}

function LowInkRow({ ink, onPress, testID }: { ink: Ink; onPress: () => void; testID?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ink.brand} ${ink.name} is low`}
      testID={testID}
      style={[styles.row, styles.lowRow]}
    >
      <View style={[styles.thumb, { backgroundColor: ink.colorHex }]}>
        <Text color="textInverse" weight="700">
          {ink.brand[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <Stack gap="xs" style={styles.flex}>
        <Text variant="caption" color="danger" weight="600">
          {ink.currentLevelPct}% left
        </Text>
        <Text variant="body" weight="600" numberOfLines={1}>
          {ink.brand} {ink.name}
        </Text>
      </Stack>
      <InkLevelDots level={ink.currentLevelPct} size={6} />
    </Pressable>
  );
}

function EmptyPenRow({ onAddPen }: { onAddPen: () => void }) {
  return (
    <View style={styles.row} testID="home-pens-empty">
      <Stack gap="xs" style={styles.flex}>
        <Text variant="small" color="textMuted">
          No pens yet. Add your first to start tracking your collection.
        </Text>
        <ButtonS
          onPress={onAddPen}
          variant="secondary"
          size="sm"
          fullWidth={false}
          testID="home-pens-empty-add"
        >
          Add pen
        </ButtonS>
      </Stack>
    </View>
  );
}

function EmptyInkRow({ onAddInk }: { onAddInk: () => void }) {
  return (
    <View style={styles.row} testID="home-inks-empty">
      <Stack gap="xs" style={styles.flex}>
        <Text variant="small" color="textMuted">
          No inks yet. Add your first to start tracking your collection.
        </Text>
        <ButtonS
          onPress={onAddInk}
          variant="secondary"
          size="sm"
          fullWidth={false}
          testID="home-inks-empty-add"
        >
          Add ink
        </ButtonS>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    padding: space.lg,
    width: layout.contentWidth,
  },
  flex: {
    flex: 1,
  },
  lowRow: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
  statCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    gap: space.xs,
    padding: space.md,
  },
  thumb: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  thumbPlaceholder: {
    backgroundColor: colors.bgMuted,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
