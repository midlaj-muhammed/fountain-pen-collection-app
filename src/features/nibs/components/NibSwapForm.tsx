/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { TextField } from '@/design/components/TextField/TextField';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import type { NibMaterial, NibSize, PenNib } from '@/types/domain';

const NIB_SIZES: NibSize[] = ['EF', 'F', 'M', 'B', 'BB', 'Custom'];
const NIB_MATERIALS: NibMaterial[] = ['steel', 'gold', 'other'];

const defaultNib: PenNib = { size: 'M', material: 'steel', customLabel: null };

export type NibSwapFormValues = {
  date: Date;
  fromNib: PenNib;
  toNib: PenNib;
  notes: string;
};

export type NibSwapFormProps = {
  uid: string | null;
  penId: string;
  initialFromNib?: PenNib;
  onSubmit: (values: NibSwapFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  testID?: string;
};

/**
 * Add/Edit Nib Swap form. The "from" nib is the pen's current nib
 * (passed in via `initialFromNib` or defaults to M/steel). The user
 * picks the new "to" nib from chip rows.
 */
export function NibSwapForm({
  uid: _uid,
  penId: _penId,
  initialFromNib,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  testID,
}: NibSwapFormProps) {
  const [fromNib, setFromNib] = useState<PenNib>(initialFromNib ?? defaultNib);
  const [toNib, setToNib] = useState<PenNib>({ size: 'M', material: 'steel', customLabel: null });
  const [notes, setNotes] = useState('');

  const sameNib = useMemo(
    () => fromNib.size === toNib.size && fromNib.material === toNib.material,
    [fromNib, toNib],
  );

  const handleSubmit = () => {
    if (sameNib) return;
    onSubmit({ date: new Date(), fromNib, toNib, notes });
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Stack flex={1} gap="lg">
          <Text variant="h1" color="accent">
            Swap nib
          </Text>

          {errorMessage ? (
            <Text variant="small" color="danger">
              {errorMessage}
            </Text>
          ) : null}

          <NibPicker
            label="From"
            value={fromNib}
            onChange={setFromNib}
            testID={`${testID}-from`}
          />
          <NibPicker
            label="To"
            value={toNib}
            onChange={setToNib}
            testID={`${testID}-to`}
          />

          {sameNib ? (
            <Text variant="small" color="textMuted">
              Choose a different nib to record a swap.
            </Text>
          ) : null}

          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            testID={`${testID}-notes`}
          />

          <Stack gap="sm">
            <ButtonS
              onPress={handleSubmit}
              disabled={isSubmitting || sameNib}
              fullWidth
              testID={`${testID}-submit`}
            >
              {isSubmitting ? 'Saving…' : 'Record swap'}
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

function NibPicker({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: PenNib;
  onChange: (nib: PenNib) => void;
  testID: string;
}) {
  return (
    <Stack gap="sm">
      <Text variant="small" color="textMuted" weight="600">
        {label}
      </Text>
      <View style={styles.chipsRow}>
        {NIB_SIZES.map((n) => (
          <Chip
            key={n}
            label={n}
            active={value.size === n}
            onPress={() => onChange({ ...value, size: n })}
            testID={`${testID}-size-${n}`}
          />
        ))}
      </View>
      <View style={styles.chipsRow}>
        {NIB_MATERIALS.map((m) => (
          <Chip
            key={m}
            label={m}
            active={value.material === m}
            onPress={() => onChange({ ...value, material: m })}
            testID={`${testID}-mat-${m}`}
          />
        ))}
      </View>
    </Stack>
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
