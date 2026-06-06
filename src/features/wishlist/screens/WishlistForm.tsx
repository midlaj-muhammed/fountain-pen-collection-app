/* eslint-disable react-native/no-raw-text */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Chip } from '@/design/components/Chip/Chip';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { TextField } from '@/design/components/TextField/TextField';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type WishlistFormValues = {
  type: 'pen' | 'ink';
  brand: string;
  name: string;
  notes: string;
};

export type WishlistFormProps = {
  onCancel: () => void;
  onSubmit: (values: WishlistFormValues) => Promise<void> | void;
  testID?: string;
};

/**
 * Add-to-wishlist form. The brand+name pair is captured at
 * wishlist time (rather than referencing a pen/ink id) so the
 * entry survives if the matching pen/ink is later deleted.
 */
export function WishlistForm({ onCancel, onSubmit, testID }: WishlistFormProps) {
  const [type, setType] = useState<'pen' | 'ink'>('pen');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const valid = brand.trim().length > 0 && name.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid) {
      setError('Brand and model are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ type, brand: brand.trim(), name: name.trim(), notes: notes.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title="Add to wishlist" />
        <Stack gap="md" style={styles.bodyStack}>
          <View style={styles.chipsRow}>
            {(['pen', 'ink'] as const).map((t) => (
              <Chip
                key={t}
                label={t === 'pen' ? 'Pen' : 'Ink'}
                active={type === t}
                onPress={() => setType(t)}
                testID={`wishlist-form-type-${t}`}
              />
            ))}
          </View>

          <TextField
            label="Brand"
            value={brand}
            onChangeText={(v) => {
              setBrand(v);
              setError(undefined);
            }}
            placeholder="e.g. Pilot"
            autoCapitalize="words"
            autoCorrect={false}
            testID={`${testID}-brand`}
          />
          <TextField
            label="Model / name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(undefined);
            }}
            placeholder="e.g. Custom 823"
            autoCapitalize="words"
            autoCorrect={false}
            testID={`${testID}-name`}
          />
          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Why you want it, target price…"
            multiline
            testID={`${testID}-notes`}
          />

          {error ? (
            <Text variant="small" color="danger">
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={styles.cancelBtn}
              testID={`${testID}-cancel`}
            >
              <Text variant="body" weight="600" color="textMuted">
                Cancel
              </Text>
            </Pressable>
            <ButtonS
              onPress={handleSubmit}
              disabled={!valid || submitting}
              fullWidth={false}
              testID={`${testID}-submit`}
            >
              {submitting ? 'Saving…' : 'Add'}
            </ButtonS>
          </View>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    justifyContent: 'flex-end',
  },
  body: {
    padding: space.lg,
  },
  bodyStack: {
    marginTop: space.md,
  },
  cancelBtn: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});

// Internal usage to keep the radius import even if a future
// tweak removes the local card; satisfies eslint no-unused-vars
// when the design tokens are imported speculatively.
void radius;
