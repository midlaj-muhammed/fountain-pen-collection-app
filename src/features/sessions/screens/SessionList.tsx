/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { FAB } from '@/design/components/FAB/FAB';
import { Rating } from '@/design/components/Rating/Rating';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import { useSessions } from '@/features/sessions/api/queries';
import type { Ink, Pen, Session } from '@/types/domain';

export type SessionListProps = {
  uid: string | null;
  onAddSession: () => void;
  onOpenSession: (sessionId: string) => void;
  testID?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

type Bucket = 'Today' | 'Yesterday' | 'This week' | 'Older';

function bucketFor(date: Date, now: Date): Bucket {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = date.getTime() - startOfToday;
  if (dayMs >= 0 && dayMs < DAY_MS) return 'Today';
  if (dayMs >= -DAY_MS && dayMs < 0) return 'Yesterday';
  if (dayMs >= -7 * DAY_MS) return 'This week';
  return 'Older';
}

const BUCKET_ORDER: Bucket[] = ['Today', 'Yesterday', 'This week', 'Older'];

/**
 * "Sessions" list. Groups sessions by date bucket (Today / Yesterday /
 * This week / Older) and shows pen + ink label, duration, and rating
 * per row. Tap a row to open SessionDetail.
 */
export function SessionList({ uid, onAddSession, onOpenSession, testID }: SessionListProps) {
  const { data: sessions, isLoading: sessionsLoading } = useSessions(uid);
  const { data: pens } = usePens(uid);
  const { data: inks } = useInks(uid);

  const penMap = useMemo(() => {
    const m = new Map<string, Pen>();
    (pens ?? []).forEach((p: Pen) => m.set(p.id, p));
    return m;
  }, [pens]);
  const inkMap = useMemo(() => {
    const m = new Map<string, Ink>();
    (inks ?? []).forEach((i: Ink) => m.set(i.id, i));
    return m;
  }, [inks]);

  const grouped = useMemo(() => {
    const out: Record<Bucket, Session[]> = {
      Today: [],
      Yesterday: [],
      'This week': [],
      Older: [],
    };
    if (!sessions) return out;
    const now = new Date();
    for (const s of sessions) {
      const d = toDate(s.date);
      out[bucketFor(d, now)].push(s);
    }
    return out;
  }, [sessions]);

  if (sessionsLoading) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="Sessions" />
        <Stack gap="md" style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </Stack>
      </View>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.wrap} testID={testID}>
        <SectionHeader title="Sessions" />
        <EmptyState
          title="No sessions yet"
          body="Log your first session to start tracking your writing."
          action={{ label: 'Log a session', onPress: onAddSession }}
        />
        <FAB onPress={onAddSession} accessibilityLabel="Add session" style={styles.fab} />
      </View>
    );
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <SectionHeader
        title="Sessions"
        right={
          <ButtonS onPress={onAddSession} variant="secondary" size="sm">
            Add new
          </ButtonS>
        }
      />
      <Stack gap="lg" style={styles.body}>
        {BUCKET_ORDER.map((bucket) => {
          const list = grouped[bucket];
          if (list.length === 0) return null;
          return (
            <Stack key={bucket} gap="sm">
              <Text variant="caption" color="textMuted" weight="700">
                {bucket}
              </Text>
              <Stack gap="sm">
                {list.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    pen={penMap.get(s.penId)}
                    ink={inkMap.get(s.inkId)}
                    onPress={() => onOpenSession(s.id)}
                  />
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
      <FAB onPress={onAddSession} accessibilityLabel="Add session" style={styles.fab} />
    </View>
  );
}

function SessionRow({
  session,
  pen,
  ink,
  onPress,
}: {
  session: Session;
  pen: Pen | undefined;
  ink: Ink | undefined;
  onPress: () => void;
}) {
  const penLabel = pen ? `${pen.brand} ${pen.model}` : '(pen removed)';
  const inkLabel = ink ? `${ink.brand} ${ink.name}` : '(ink removed)';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${penLabel} with ${inkLabel}`}
      style={styles.row}
    >
      <Stack gap="xs" style={styles.flex}>
        <Text variant="body" weight="600" numberOfLines={1}>
          {penLabel}
        </Text>
        <Text variant="small" color="textMuted" numberOfLines={1}>
          {inkLabel} · {session.durationMin} min
        </Text>
      </Stack>
      <Rating value={session.rating} size={16} />
    </Pressable>
  );
}

function toDate(value: Session['date']): Date {
  if (value instanceof Date) return value;
  // Firestore Timestamp-like object: { toDate(): Date, seconds, ... }
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value && typeof (value as { seconds?: number }).seconds === 'number') {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return new Date();
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
  row: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
