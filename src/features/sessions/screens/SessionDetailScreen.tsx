/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Modal } from '@/design/components/Modal/Modal';
import { Rating } from '@/design/components/Rating/Rating';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import { useDeleteSession, useSession } from '@/features/sessions/api/queries';
import type { Ink, Pen } from '@/types/domain';

export type SessionDetailScreenProps = {
  uid: string | null;
  sessionId: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  testID?: string;
};

/**
 * Read-only detail view of a single writing session. Surfaces pen,
 * ink, duration, rating, ink-dried-out flag, and notes. Includes
 * Edit (navigates to SessionForm) and Delete (soft-delete + goBack)
 * actions with a confirm modal.
 */
export function SessionDetailScreen({
  uid,
  sessionId,
  onEdit,
  onDelete,
  onBack,
  testID,
}: SessionDetailScreenProps) {
  const { data: session, isLoading } = useSession(uid, sessionId);
  const { data: pens } = usePens(uid);
  const { data: inks } = useInks(uid);
  const deleteSession = useDeleteSession(uid);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !session) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="text" lines={5} />
        </View>
      </SafeAreaView>
    );
  }

  const pen = (pens ?? []).find((p: Pen) => p.id === session.penId);
  const ink = (inks ?? []).find((i: Ink) => i.id === session.inkId);
  const penLabel = pen ? `${pen.brand} ${pen.model}` : '(pen removed)';
  const inkLabel = ink ? `${ink.brand} ${ink.name}` : '(ink removed)';

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(sessionId);
      onDelete();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <Stack flex={1} gap="lg">
          <Stack gap="xs">
            <Text variant="caption" color="textMuted">
              {formatDate(session.date)}
            </Text>
            <Text variant="h1" color="accent">
              Writing session
            </Text>
          </Stack>

          <View style={styles.metaRow}>
            <MetaCell label="Pen" value={penLabel} />
            <MetaCell label="Ink" value={inkLabel} />
            <MetaCell label="Duration" value={`${session.durationMin} min`} />
          </View>

          <Stack axis="horizontal" align="center" gap="md" style={styles.ratingRow}>
            <Text variant="small" color="textMuted" weight="600">
              Rating
            </Text>
            <Rating value={session.rating} size={20} />
          </Stack>

          {session.inkDriedOut ? (
            <View style={styles.dryPill}>
              <Text variant="small" color="danger" weight="600">
                Ink dried out
              </Text>
            </View>
          ) : null}

          {session.notes ? (
            <Stack gap="xs">
              <Text variant="small" color="textMuted" weight="600">
                Notes
              </Text>
              <Text variant="body">{session.notes}</Text>
            </Stack>
          ) : null}

          <Stack gap="sm">
            <Stack axis="horizontal" gap="sm">
              <View style={styles.flex}>
                <ButtonS onPress={onEdit} variant="primary" fullWidth>
                  Edit
                </ButtonS>
              </View>
              <View style={styles.flex}>
                <ButtonS onPress={onBack} variant="ghost" fullWidth>
                  Back
                </ButtonS>
              </View>
            </Stack>
            <ButtonS
              onPress={() => setConfirmOpen(true)}
              variant="ghost"
              fullWidth
              testID="sd-delete"
            >
              Delete session
            </ButtonS>
          </Stack>
        </Stack>
      </ScrollView>

      <Modal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Stack gap="md">
          <Text variant="h2">Delete this session?</Text>
          <Text variant="body" color="textMuted">
            The session will be moved to Trash and removed from your list.
          </Text>
          <Stack axis="horizontal" gap="sm">
            <View style={styles.flex}>
              <ButtonS variant="ghost" onPress={() => setConfirmOpen(false)} fullWidth>
                Cancel
              </ButtonS>
            </View>
            <View style={styles.flex}>
              <ButtonS
                variant="primary"
                onPress={() => {
                  setConfirmOpen(false);
                  handleDelete();
                }}
                fullWidth
              >
                Delete
              </ButtonS>
            </View>
          </Stack>
        </Stack>
      </Modal>
    </SafeAreaView>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="xs" style={styles.flex}>
      <Text variant="small" color="textMuted" weight="600">
        {label}
      </Text>
      <Text variant="body" numberOfLines={1}>
        {value}
      </Text>
    </Stack>
  );
}

function formatDate(date: { toDate?: () => Date; seconds?: number } | Date): string {
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (typeof date.seconds === 'number') {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date();
  }
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    padding: space.lg,
    width: layout.contentWidth,
  },
  dryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  flex: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  ratingRow: {
    paddingVertical: space.sm,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
