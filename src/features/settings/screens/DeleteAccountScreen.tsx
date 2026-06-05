/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { TextField } from '@/design/components/TextField/TextField';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { deleteUserData } from '@/lib/firebase/deleteUserData';

export type DeleteAccountScreenProps = {
  uid: string | null;
  onBack: () => void;
  onDeleted: () => void;
  testID?: string;
};

const CONFIRM_TEXT = 'DELETE';

/**
 * "Type DELETE to confirm" pattern. Calls the `deleteUserData` Cloud
 * Function (stubbed for now) which cascade-deletes the user's data
 * and the Auth user. On success, fires onDeleted so the host can
 * route back to the Welcome screen.
 */
export function DeleteAccountScreen({ uid, onBack, onDeleted, testID }: DeleteAccountScreenProps) {
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const canDelete = confirm === CONFIRM_TEXT;

  const handleDelete = async () => {
    if (!canDelete || !uid) return;
    setBusy(true);
    try {
      await deleteUserData(uid);
      onDeleted();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <Stack flex={1} gap="lg">
          <SectionHeader title="Delete account" />

          <View style={styles.warnCard}>
            <Text variant="body" weight="700" color="danger">
              This action cannot be undone.
            </Text>
            <Text variant="body" color="textMuted" style={styles.warnText}>
              We will permanently delete:
            </Text>
            <Stack gap="xs" style={styles.list}>
              <Text variant="body">· Your profile and settings</Text>
              <Text variant="body">· Every pen, ink, and session you logged</Text>
              <Text variant="body">· Every nib-swap record</Text>
              <Text variant="body">· All uploaded photos</Text>
            </Stack>
          </View>

          <Stack gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              Type DELETE in capitals below to confirm.
            </Text>
            <TextField
              label="Confirmation"
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="characters"
              autoCorrect={false}
              testID={`${testID}-confirm`}
            />
          </Stack>

          <Stack gap="sm">
            <ButtonS
              onPress={handleDelete}
              disabled={!canDelete || busy}
              fullWidth
              testID={`${testID}-delete`}
            >
              {busy ? 'Deleting…' : 'Delete account'}
            </ButtonS>
            <ButtonS onPress={onBack} variant="ghost" fullWidth>
              Cancel
            </ButtonS>
          </Stack>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: space.lg,
  },
  list: {
    marginTop: space.sm,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  warnCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    gap: space.sm,
    padding: space.md,
  },
  warnText: {
    marginTop: space.xs,
  },
});
