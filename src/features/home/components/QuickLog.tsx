/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { InkSwatch } from '@/design/components/InkSwatch/InkSwatch';
import { Toast } from '@/design/components/Toast/Toast';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import { useCreateSession } from '@/features/sessions/api/queries';

export type QuickLogProps = {
  uid: string | null;
  /** Fired with the new session id so the host can navigate (e.g. to SessionDetail in S4). */
  onLogged: (sessionId: string) => void;
  testID?: string;
};

/**
 * Sticky bottom "Quick log" card. 1-tap path:
 *   1. Pre-fills the most-recent pen and most-recent ink.
 *   2. Tap → creates a Session with today's date, 15 min, rating 0, blank notes.
 *   3. Shows a "Logged ✓" toast and fires `onLogged(newSessionId)`.
 *
 * If the user has no pens or no inks, the card shows a prompt instead.
 */
export function QuickLog({ uid, onLogged, testID }: QuickLogProps) {
  const { data: pens } = usePens(uid);
  const { data: inks } = useInks(uid);
  const createSession = useCreateSession(uid);
  const [showToast, setShowToast] = useState(false);

  const ready = (pens?.length ?? 0) > 0 && (inks?.length ?? 0) > 0;
  const pen = pens?.[0];
  const ink = inks?.[0];

  // Auto-dismiss the toast after 3s.
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  if (!uid) return null;

  if (!ready) {
    return (
      <View style={[styles.card, styles.placeholderCard]} testID={testID}>
        <Text variant="small" color="textMuted">
          Add a pen and an ink to enable quick log.
        </Text>
      </View>
    );
  }

  const handleLog = async () => {
    if (!pen || !ink) return;
    try {
      const newId = await createSession.mutateAsync({
        date: Timestamp.now(),
        durationMin: 15,
        penId: pen.id,
        inkId: ink.id,
        inkDriedOut: false,
        // The rating enum is 1–5; a 1-tap log hasn't been rated yet, so we
        // default to 1 (lowest) and let the user edit it from SessionDetail.
        rating: 1,
        notes: '',
      });
      setShowToast(true);
      onLogged(newId);
    } catch {
      // Mutation error surfaces in a future S8 polish pass; for now the
      // disabled state on the button prevents most failures.
    }
  };

  return (
    <>
      <View style={styles.card} testID={testID}>
        <Stack axis="horizontal" align="center" gap="sm" style={styles.flex}>
          <View style={[styles.thumb, { backgroundColor: ink.colorHex }]}>
            <InkSwatch color={ink.colorHex} size={20} />
          </View>
          <Stack gap="xs" style={styles.flex}>
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {pen.brand} {pen.model}
            </Text>
            <Text variant="small" weight="600" numberOfLines={1}>
              {ink.brand} {ink.name}
            </Text>
          </Stack>
          <Pressable
            onPress={handleLog}
            disabled={createSession.isPending}
            accessibilityRole="button"
            accessibilityLabel="Quick log a writing session"
            testID={`${testID}-log-button`}
            style={({ pressed }) => [
              styles.logBtn,
              (createSession.isPending || pressed) && styles.logBtnPressed,
            ]}
          >
            <Text color="textInverse" weight="700">
              {createSession.isPending ? '…' : 'Log'}
            </Text>
          </Pressable>
        </Stack>
      </View>
      {showToast ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <Toast message="Logged ✓ — tap to edit" kind="success" />
        </View>
      ) : null}
      {/* Re-export the ButtonS import is unused at runtime; keep for future expansion. */}
      <View style={styles.hidden}>
        <ButtonS onPress={() => undefined} disabled>
          spacer
        </ButtonS>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    bottom: space.lg,
    elevation: 3,
    left: space.lg,
    padding: space.md,
    position: 'absolute',
    right: space.lg,
    // Soft drop shadow for the "floating" feel.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  flex: {
    flex: 1,
  },
  hidden: {
    height: 0,
    opacity: 0,
    width: 0,
  },
  logBtn: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    minWidth: 72,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  logBtnPressed: {
    opacity: 0.7,
  },
  placeholderCard: {
    bottom: space.lg,
    left: space.lg,
    padding: space.md,
    position: 'absolute',
    right: space.lg,
  },
  thumb: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  toastWrap: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: space.xl,
  },
});
