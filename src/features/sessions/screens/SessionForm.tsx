/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Rating } from '@/design/components/Rating/Rating';
import { TextField } from '@/design/components/TextField/TextField';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import { useSession } from '@/features/sessions/api/queries';
import type { Ink, Pen, Session } from '@/types/domain';

const schema = z.object({
  date: z.date(),
  penId: z.string().min(1, 'Pick a pen'),
  inkId: z.string().min(1, 'Pick an ink'),
  durationMin: z.coerce.number().int().positive('Duration must be positive'),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  inkDriedOut: z.boolean(),
  notes: z.string(),
});

export type SessionFormValues = z.infer<typeof schema>;

export type SessionFormProps = {
  uid: string | null;
  initial?: Session;
  /** When set, the form will fetch and pre-fill the session by id. Ignored if `initial` is provided. */
  sessionId?: string | undefined;
  onSubmit: (values: SessionFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  testID?: string;
};

const defaultValues: SessionFormValues = {
  date: new Date(),
  penId: '',
  inkId: '',
  durationMin: 15,
  rating: 1,
  inkDriedOut: false,
  notes: '',
};

/**
 * Add/Edit Session form. Required: a pen and an ink. Default values come
 * from the most-recently-updated pen + ink (the user's "last used" pair).
 */
export function SessionForm({
  uid,
  initial,
  sessionId,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  testID,
}: SessionFormProps) {
  const { data: pens } = usePens(uid);
  const { data: inks } = useInks(uid);
  const { data: fetched } = useSession(uid, sessionId ?? null);
  const source = initial ?? fetched ?? undefined;
  const [values, setValues] = useState<SessionFormValues>(() => initialise(source, pens, inks));

  const set = <K extends keyof SessionFormValues>(key: K, v: SessionFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const errors = useMemo(() => validate(values), [values]);
  const ready = (pens?.length ?? 0) > 0 && (inks?.length ?? 0) > 0;

  // Once pens/inks load, pre-fill the form for a brand-new session.
  useEffect(() => {
    if (source) return; // don't clobber an existing session's values
    setValues((prev) => {
      const next = { ...prev };
      if (!prev.penId && pens?.[0]?.id) next.penId = pens[0].id;
      if (!prev.inkId && inks?.[0]?.id) next.inkId = inks[0].id;
      return next;
    });
  }, [pens, inks, source]);

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0) return;
    await onSubmit(values);
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <Text variant="h1" color="accent">
            {source ? 'Edit session' : 'Add session'}
          </Text>
          <Text variant="body" color="textMuted">
            Add a pen and an ink first to log a session.
          </Text>
          <ButtonS onPress={onCancel} variant="primary" fullWidth testID={`${testID}-cancel`}>
            Back
          </ButtonS>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Stack flex={1} gap="lg">
          <Text variant="h1" color="accent">
            {source ? 'Edit session' : 'Add session'}
          </Text>

          {errorMessage ? (
            <Text variant="small" color="danger">
              {errorMessage}
            </Text>
          ) : null}

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Pen
            </Text>
            <Stack axis="horizontal" gap="sm" style={styles.chipsRow}>
              {(pens ?? []).map((p: Pen) => (
                <Chip
                  key={p.id}
                  label={`${p.brand} ${p.model}`}
                  active={values.penId === p.id}
                  onPress={() => set('penId', p.id)}
                  testID={`${testID}-pen-${p.id}`}
                />
              ))}
            </Stack>
          </Stack>

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Ink
            </Text>
            <Stack axis="horizontal" gap="sm" style={styles.chipsRow}>
              {(inks ?? []).map((i: Ink) => (
                <Chip
                  key={i.id}
                  label={`${i.brand} ${i.name}`}
                  active={values.inkId === i.id}
                  onPress={() => set('inkId', i.id)}
                  testID={`${testID}-ink-${i.id}`}
                />
              ))}
            </Stack>
          </Stack>

          <TextField
            label="Duration (minutes)"
            value={String(values.durationMin)}
            onChangeText={(v) => set('durationMin', Number(v) || 0)}
            keyboardType="number-pad"
            error={errors.durationMin}
            testID={`${testID}-duration`}
          />

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Rating
            </Text>
            <Rating
              value={values.rating}
              onChange={(r) => set('rating', r)}
              testID={`${testID}-rating`}
            />
          </Stack>

          <Stack axis="horizontal" align="center" gap="sm">
            <Pressable
              onPress={() => set('inkDriedOut', !values.inkDriedOut)}
              accessibilityRole="switch"
              accessibilityState={{ checked: values.inkDriedOut }}
              testID={`${testID}-ink-dried`}
              style={[styles.toggle, values.inkDriedOut && styles.toggleOn]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  values.inkDriedOut && styles.toggleKnobOn,
                ]}
              />
            </Pressable>
            <Text variant="body">Ink dried out?</Text>
          </Stack>

          <TextField
            label="Notes"
            value={values.notes}
            onChangeText={(v) => set('notes', v)}
            multiline
            numberOfLines={3}
            testID={`${testID}-notes`}
          />

          <Stack gap="sm">
            <ButtonS
              onPress={handleSubmit}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              fullWidth
              testID={`${testID}-submit`}
            >
              {isSubmitting ? 'Saving…' : source ? 'Save changes' : 'Add session'}
            </ButtonS>
            <ButtonS onPress={onCancel} variant="ghost" fullWidth>
              Cancel
            </ButtonS>
          </Stack>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      testID={testID}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text variant="small" weight="600" color={active ? 'textInverse' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

function initialise(
  initial: Session | undefined,
  pens: ReturnType<typeof usePens>['data'],
  inks: ReturnType<typeof useInks>['data'],
): SessionFormValues {
  if (initial) {
    return {
      date: initial.date instanceof Date ? initial.date : new Date(),
      penId: initial.penId,
      inkId: initial.inkId,
      durationMin: initial.durationMin,
      rating: initial.rating,
      inkDriedOut: initial.inkDriedOut,
      notes: initial.notes,
    };
  }
  // Pre-fill with the first (most-recent) pen + ink.
  return {
    ...defaultValues,
    penId: pens?.[0]?.id ?? '',
    inkId: inks?.[0]?.id ?? '',
  };
}

function validate(values: SessionFormValues): Partial<Record<keyof SessionFormValues, string>> {
  const parsed = schema.safeParse(values);
  if (parsed.success) return {};
  const out: Partial<Record<keyof SessionFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof SessionFormValues | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

const styles = StyleSheet.create({
  body: {
    padding: space.lg,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 80,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  toggle: {
    alignItems: 'flex-start',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    padding: 2,
    width: 48,
  },
  toggleKnob: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    height: 24,
    width: 24,
  },
  toggleKnobOn: {
    backgroundColor: colors.accent,
    transform: [{ translateX: 20 }],
  },
  toggleOn: {
    backgroundColor: colors.accent,
  },
});
