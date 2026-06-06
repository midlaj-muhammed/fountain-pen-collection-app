/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { TextField } from '@/design/components/TextField/TextField';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import type { NibMaterial, NibSize, Pen, PenNib } from '@/types/domain';

const NIB_SIZES: NibSize[] = ['EF', 'F', 'M', 'B', 'BB', 'Custom'];
const NIB_MATERIALS: NibMaterial[] = ['steel', 'gold', 'other'];

const schema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  nibSize: z.enum(['EF', 'F', 'M', 'B', 'BB', 'Custom']),
  nibMaterial: z.enum(['steel', 'gold', 'other']),
  nibCustomLabel: z.string().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Pick a hex colour'),
  notes: z.string(),
});

export type PenFormValues = z.infer<typeof schema>;

export type PenFormProps = {
  initial?: Pen;
  onSubmit: (values: PenFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  testID?: string;
};

const defaultValues: PenFormValues = {
  brand: '',
  model: '',
  nibSize: 'M',
  nibMaterial: 'steel',
  nibCustomLabel: null,
  color: '#1A1A1A',
  notes: '',
};

/**
 * Add/Edit Pen form. The nib size + material render as Chip rows. The colour
 * is a hex string in v1; a proper colour picker is a P3.5 polish item.
 */
export function PenForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  testID,
}: PenFormProps) {
  const [values, setValues] = useState<PenFormValues>(() => initialise(initial));

  const set = <K extends keyof PenFormValues>(key: K, v: PenFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const errors = useMemo(() => validate(values), [values]);

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) return;
    onSubmit(values);
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Stack flex={1} gap="lg">
          <Text variant="h1" color="accent">
            {initial ? 'Edit pen' : 'Add pen'}
          </Text>

          {errorMessage ? (
            <Text variant="small" color="danger">
              {errorMessage}
            </Text>
          ) : null}

          <Stack gap="md">
            <TextField
              label="Brand"
              value={values.brand}
              onChangeText={(v) => set('brand', v)}
              error={errors.brand}
              testID={`${testID}-brand`}
            />
            <TextField
              label="Model"
              value={values.model}
              onChangeText={(v) => set('model', v)}
              error={errors.model}
              testID={`${testID}-model`}
            />
            <TextField
              label="Colour (hex)"
              value={values.color}
              onChangeText={(v) => set('color', v)}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.color}
              testID={`${testID}-color`}
            />
            <TextField
              label="Notes"
              value={values.notes}
              onChangeText={(v) => set('notes', v)}
              multiline
              numberOfLines={3}
              testID={`${testID}-notes`}
            />
          </Stack>

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Nib size
            </Text>
            <View style={styles.chipsRow}>
              {NIB_SIZES.map((n) => (
                <NibChip
                  key={n}
                  label={n}
                  active={values.nibSize === n}
                  onPress={() => set('nibSize', n)}
                  testID={`${testID}-nibsize-${n}`}
                />
              ))}
            </View>
          </Stack>

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Nib material
            </Text>
            <View style={styles.chipsRow}>
              {NIB_MATERIALS.map((m) => (
                <NibChip
                  key={m}
                  label={m}
                  active={values.nibMaterial === m}
                  onPress={() => set('nibMaterial', m)}
                  testID={`${testID}-nibmat-${m}`}
                />
              ))}
            </View>
          </Stack>

          <Stack gap="sm">
            <ButtonS
              onPress={handleSubmit}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              fullWidth
              testID={`${testID}-submit`}
            >
              {isSubmitting ? 'Saving…' : initial ? 'Save changes' : 'Add pen'}
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

function NibChip({
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
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <Text
        variant="small"
        weight="600"
        color={active ? 'textInverse' : 'text'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function initialise(initial?: Pen): PenFormValues {
  if (!initial) return defaultValues;
  return {
    brand: initial.brand,
    model: initial.model,
    nibSize: initial.nib.size,
    nibMaterial: initial.nib.material,
    nibCustomLabel: initial.nib.customLabel,
    color: initial.color,
    notes: initial.notes,
  };
}

function validate(values: PenFormValues): Partial<Record<keyof PenFormValues, string>> {
  const parsed = schema.safeParse(values);
  if (parsed.success) return {};
  const out: Partial<Record<keyof PenFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof PenFormValues | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

// Re-export the PenNib type so feature code can use it without importing from types.
export type { PenNib };

const styles = StyleSheet.create({
  body: {
    padding: space.lg,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 44,
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
});

// Re-export the layout constant so callers can size a container if needed.
export const __contentWidth = layout.contentWidth;
