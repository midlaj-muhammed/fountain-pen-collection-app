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
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import type { Ink, InkLevelPct } from '@/types/domain';

const LEVEL_STEPS: InkLevelPct[] = [0, 20, 40, 60, 80, 100];

const schema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Pick a hex colour'),
  colorName: z.string(),
  bottleSizeMl: z.coerce.number().int().positive('Size must be positive'),
  isCartridge: z.boolean(),
  currentLevelPct: z.union([
    z.literal(0),
    z.literal(20),
    z.literal(40),
    z.literal(60),
    z.literal(80),
    z.literal(100),
  ]),
  notes: z.string(),
});

export type InkFormValues = z.infer<typeof schema>;

export type InkFormProps = {
  initial?: Ink;
  onSubmit: (values: InkFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  testID?: string;
};

const defaultValues: InkFormValues = {
  brand: '',
  name: '',
  colorHex: '#1A1A1A',
  colorName: '',
  bottleSizeMl: 30,
  isCartridge: false,
  currentLevelPct: 100,
  notes: '',
};

/**
 * Add/Edit Ink form. Cartridge vs bottle is a chip toggle; bottle size +
 * 5-step level are only shown for bottles. Color is a hex string in v1.
 */
export function InkForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  testID,
}: InkFormProps) {
  const [values, setValues] = useState<InkFormValues>(() => initialise(initial));

  const set = <K extends keyof InkFormValues>(key: K, v: InkFormValues[K]) =>
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
            {initial ? 'Edit ink' : 'Add ink'}
          </Text>

          {errorMessage ? (
            <Text variant="small" color="danger">
              {errorMessage}
            </Text>
          ) : null}

          <Stack axis="horizontal" gap="sm">
            <FormChip
              label="Bottle"
              active={!values.isCartridge}
              onPress={() => set('isCartridge', false)}
              testID={`${testID}-type-bottle`}
            />
            <FormChip
              label="Cartridge"
              active={values.isCartridge}
              onPress={() => set('isCartridge', true)}
              testID={`${testID}-type-cartridge`}
            />
          </Stack>

          <Stack gap="md">
            <TextField
              label="Brand"
              value={values.brand}
              onChangeText={(v) => set('brand', v)}
              error={errors.brand}
              testID={`${testID}-brand`}
            />
            <TextField
              label="Name"
              value={values.name}
              onChangeText={(v) => set('name', v)}
              error={errors.name}
              testID={`${testID}-name`}
            />
            <TextField
              label="Colour (hex)"
              value={values.colorHex}
              onChangeText={(v) => set('colorHex', v)}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.colorHex}
              testID={`${testID}-colorHex`}
            />
            <TextField
              label="Colour name"
              value={values.colorName}
              onChangeText={(v) => set('colorName', v)}
              testID={`${testID}-colorName`}
            />
            {!values.isCartridge ? (
              <TextField
                label="Bottle size (ml)"
                value={String(values.bottleSizeMl)}
                onChangeText={(v) => set('bottleSizeMl', Number(v) || 0)}
                keyboardType="number-pad"
                error={errors.bottleSizeMl}
                testID={`${testID}-bottleSizeMl`}
              />
            ) : null}
            <TextField
              label="Notes"
              value={values.notes}
              onChangeText={(v) => set('notes', v)}
              multiline
              numberOfLines={3}
              testID={`${testID}-notes`}
            />
          </Stack>

          {!values.isCartridge ? (
            <Stack gap="sm">
              <Text variant="small" color="textMuted" weight="600">
                Fill level
              </Text>
              <View style={styles.chipsRow}>
                {LEVEL_STEPS.map((n) => (
                  <FormChip
                    key={n}
                    label={`${n}%`}
                    active={values.currentLevelPct === n}
                    onPress={() => set('currentLevelPct', n)}
                    testID={`${testID}-level-${n}`}
                  />
                ))}
              </View>
            </Stack>
          ) : null}

          <Stack gap="sm">
            <ButtonS
              onPress={handleSubmit}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              fullWidth
              testID={`${testID}-submit`}
            >
              {isSubmitting ? 'Saving…' : initial ? 'Save changes' : 'Add ink'}
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

function FormChip({
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

function initialise(initial?: Ink): InkFormValues {
  if (!initial) return defaultValues;
  return {
    brand: initial.brand,
    name: initial.name,
    colorHex: initial.colorHex,
    colorName: initial.colorName,
    bottleSizeMl: initial.bottleSizeMl,
    isCartridge: initial.isCartridge,
    currentLevelPct: initial.currentLevelPct,
    notes: initial.notes,
  };
}

function validate(values: InkFormValues): Partial<Record<keyof InkFormValues, string>> {
  const parsed = schema.safeParse(values);
  if (parsed.success) return {};
  const out: Partial<Record<keyof InkFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof InkFormValues | undefined;
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
