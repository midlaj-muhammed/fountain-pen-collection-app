/* eslint-disable react-native/no-raw-text */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar } from '@/design/components/Calendar/Calendar';
import { EmptyState } from '@/design/components/EmptyState/EmptyState';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { sessionDateKeys, sessionsOnDate, toISODateKey } from '@/features/calendar/api/calendar';
import { useSessions } from '@/features/sessions/api/queries';
import type { Session } from '@/types/domain';

export type CalendarScreenProps = {
  uid: string | null;
  onOpenSession?: (sessionId: string) => void;
  testID?: string;
};

/**
 * "Calendar" tab. Shows a month grid backed by the existing
 * `react-native-calendars` Calendar design component, with a dot
 * under each day that has at least one writing session. Below
 * the grid, lists every session for the selected day so the user
 * can review what they wrote with which pen/ink.
 *
 * Data source: the existing `sessions` Firestore collection,
 * loaded via the same `useSessions` hook the other screens use.
 * We compute per-day buckets in-memory; no schema change needed.
 */
export function CalendarScreen({ uid, onOpenSession, testID }: CalendarScreenProps) {
  const { data: sessions, isLoading } = useSessions(uid);
  const [selectedKey, setSelectedKey] = useState<string>(toISODateKey(new Date()));

  const markedKeys = useMemo(() => (sessions ? sessionDateKeys(sessions) : []), [sessions]);
  const dayList = useMemo<Session[]>(
    () => (sessions ? sessionsOnDate(sessions, selectedKey) : []),
    [sessions, selectedKey],
  );
  // Group by pen+ink so the list reads as "two sessions with TWSBI Eco
  // + Iroshizuku Asa-gao" rather than four near-duplicate rows.
  const grouped = useMemo(() => groupByPenInk(dayList), [dayList]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader title="Calendar" />
          <Stack gap="md">
            <Skeleton variant="row" />
            <Skeleton variant="text" lines={3} />
          </Stack>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title="Calendar" />
        <Stack gap="md" style={styles.bodyStack}>
          <Calendar
            sessionDates={markedKeys}
            onSelectDate={(d) => setSelectedKey(toISODateKey(d))}
            testID={`${testID}-calendar`}
          />

          <View style={styles.dayHeader}>
            <Text variant="body" weight="600">
              {formatLongDate(selectedKey)}
            </Text>
            <Text variant="small" color="textMuted">
              {dayList.length === 0
                ? 'No sessions'
                : `${dayList.length} session${dayList.length === 1 ? '' : 's'}`}
            </Text>
          </View>

          {dayList.length === 0 ? (
            <EmptyState
              title="Nothing logged on this day"
              body="Pick a day with a dot to see what you wrote."
            />
          ) : (
            <Stack gap="sm">
              {grouped.map((g) => (
                <Pressable
                  key={`${g.penId}-${g.inkId}`}
                  style={styles.sessionCard}
                  onPress={() => {
                    // No detail-screen wired yet; tapping a card is
                    // a future affordance. For now, just open the
                    // first session of the group if the parent
                    // supplied a handler.
                    if (onOpenSession && g.sessions[0]) {
                      onOpenSession(g.sessions[0].id);
                    }
                  }}
                  testID={`${testID}-session-${g.penId}-${g.inkId}`}
                >
                  <Stack gap="xs">
                    <Text variant="body" weight="600">
                      {g.label}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {g.sessions.length} session
                      {g.sessions.length === 1 ? '' : 's'}
                      {g.totalMinutes
                        ? ` · ${g.totalMinutes} min total`
                        : ''}
                      {g.averageRating
                        ? ` · ${'★'.repeat(g.averageRating)}${'☆'.repeat(5 - g.averageRating)}`
                        : ''}
                    </Text>
                  </Stack>
                </Pressable>
              ))}
            </Stack>
          )}
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helpers ─────────────────────────────────────────────────

type Group = {
  penId: string;
  inkId: string;
  label: string;
  sessions: Session[];
  totalMinutes: number;
  averageRating: number;
};

/**
 * Group a day's sessions by pen+ink. We don't have pen/ink
 * denormalised onto the Session record (it's just IDs), so the
 * label is "Pen {penId} / Ink {inkId}" for now. A future polish
 * pass should join against the pens/inks caches for a real name.
 */
function groupByPenInk(sessions: Session[]): Group[] {
  const map = new Map<string, Group>();
  for (const s of sessions) {
    const key = `${s.penId}::${s.inkId}`;
    const g =
      map.get(key) ??
      {
        penId: s.penId,
        inkId: s.inkId,
        label: `Pen ${shortId(s.penId)} · Ink ${shortId(s.inkId)}`,
        sessions: [],
        totalMinutes: 0,
        averageRating: 0,
      };
    g.sessions.push(s);
    g.totalMinutes += s.durationMin ?? 0;
    map.set(key, g);
  }
  for (const g of map.values()) {
    const ratings = g.sessions.map((s) => s.rating);
    g.averageRating = ratings.length
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0;
  }
  return Array.from(map.values()).sort((a, b) => b.sessions.length - a.sessions.length);
}

function shortId(id: string): string {
  return id.length > 6 ? id.slice(0, 4) + '…' : id;
}

function formatLongDate(key: string): string {
  const d = new Date(key + 'T00:00:00');
  if (isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  body: {
    padding: space.lg,
  },
  bodyStack: {
    marginTop: space.md,
  },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  sessionCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.md,
  },
});
