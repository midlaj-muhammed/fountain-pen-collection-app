/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useStats } from '@/features/stats/api/queries';

export type StatsScreenProps = {
  uid: string | null;
  testID?: string;
};

/**
 * Stats dashboard. Top cards: total sessions, total minutes, average
 * rating, current streak. Sections: top pens, top inks, monthly bars.
 * Empty state when there are no sessions.
 */
export function StatsScreen({ uid, testID }: StatsScreenProps) {
  const stats = useStats(uid);

  if (stats === null) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="Stats" />
        <Stack gap="md" style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="text" lines={3} />
        </Stack>
      </View>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="Stats" />
        <View style={styles.body}>
          <Text variant="body" color="textMuted" testID={`${testID}-empty`}>
            No sessions yet. Log a session to start building stats.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.body} testID={testID}>
      <SectionHeader title="Stats" />

      <Stack gap="sm" style={styles.cards}>
        <View style={styles.cardRow}>
          <StatCard label="Sessions" value={String(stats.totalSessions)} testID="st-sessions" />
          <StatCard label="Minutes" value={`${stats.totalMinutes}`} testID="st-minutes" />
        </View>
        <View style={styles.cardRow}>
          <StatCard label="Avg rating" value={String(stats.averageRating)} testID="st-rating" />
          <StatCard
            label="Streak"
            value={stats.streak === 0 ? '—' : `${stats.streak}d`}
            testID="st-streak"
          />
        </View>
      </Stack>

      <Stack gap="sm" style={styles.section}>
        <SectionHeader title="Top pens" />
        {stats.topPens.length === 0 ? (
          <Text variant="body" color="textMuted">
            No pens used yet.
          </Text>
        ) : (
          stats.topPens.slice(0, 3).map((p) => (
            <View key={p.id} style={styles.row}>
              <Text variant="body" weight="600" style={styles.flex}>
                {p.entity?.brand} {p.entity?.model}
              </Text>
              <Text variant="small" color="textMuted">
                {p.count} session{p.count === 1 ? '' : 's'}
              </Text>
            </View>
          ))
        )}
      </Stack>

      <Stack gap="sm" style={styles.section}>
        <SectionHeader title="Top inks" />
        {stats.topInks.length === 0 ? (
          <Text variant="body" color="textMuted">
            No inks used yet.
          </Text>
        ) : (
          stats.topInks.slice(0, 3).map((i) => (
            <View key={i.id} style={styles.row}>
              <Text variant="body" weight="600" style={styles.flex}>
                {i.entity?.brand} {i.entity?.name}
              </Text>
              <Text variant="small" color="textMuted">
                {i.count} session{i.count === 1 ? '' : 's'}
              </Text>
            </View>
          ))
        )}
      </Stack>

      <Stack gap="sm" style={styles.section}>
        <SectionHeader title="Monthly" />
        {stats.monthly.slice(0, 6).map((b) => {
          const maxCount = Math.max(...stats.monthly.map((x) => x.count), 1);
          const barWidth = `${Math.round((b.count / maxCount) * 100)}%` as const;
          return (
            <View key={b.key} style={styles.barRow}>
              <Text variant="caption" color="textMuted" style={styles.barLabel}>
                {b.key}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: barWidth }]} />
              </View>
              <Text variant="caption" color="textMuted">
                {b.count}
              </Text>
            </View>
          );
        })}
      </Stack>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  testID,
}: {
  label: string;
  value: string;
  testID?: string;
}) {
  return (
    <View style={styles.card} testID={testID}>
      <Text variant="caption" color="textMuted" weight="600">
        {label}
      </Text>
      <Text variant="h2" color="accent">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  barFill: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    height: 8,
  },
  barLabel: {
    width: 64,
  },
  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  barTrack: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: space.lg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flex: 1,
    gap: space.xs,
    padding: space.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  cards: {
    marginTop: space.sm,
  },
  flex: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
  section: {
    marginTop: space.lg,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
