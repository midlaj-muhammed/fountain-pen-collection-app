/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { InkLevelDots } from '@/design/components/InkLevelDots/InkLevelDots';
import { InkSwatch } from '@/design/components/InkSwatch/InkSwatch';
import { Modal } from '@/design/components/Modal/Modal';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useDeleteInk, useInk } from '@/features/inks/api/queries';

export type InkDetailScreenProps = {
  uid: string | null;
  inkId: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  testID?: string;
};

export function InkDetailScreen({
  uid,
  inkId,
  onEdit,
  onDelete,
  onBack,
  testID,
}: InkDetailScreenProps) {
  const { data: ink, isLoading } = useInk(uid, inkId);
  const deleteInkMutation = useDeleteInk(uid);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !ink) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <Skeleton variant="row" />
          <Skeleton variant="text" lines={5} />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteInkMutation.mutateAsync(inkId);
      onDelete();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <Stack flex={1} gap="lg">
          <View style={styles.swatchRow}>
            <View style={[styles.swatchBig, { backgroundColor: ink.colorHex }]}>
              <Text color="textInverse" weight="700" style={styles.swatchInitial}>
                {ink.brand[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Stack gap="xs" style={styles.flex}>
              <Text variant="caption" color="textMuted">
                {ink.brand}
              </Text>
              <Text variant="h1" color="accent">
                {ink.name}
              </Text>
              <Stack axis="horizontal" align="center" gap="xs">
                <InkSwatch color={ink.colorHex} size={10} />
                <Text variant="small" color="textMuted">
                  {ink.colorName || '—'}
                </Text>
              </Stack>
            </Stack>
          </View>

          <Stack axis="horizontal" justify="space-between" style={styles.metaRow}>
            <Stack gap="xs">
              <Text variant="small" color="textMuted" weight="600">
                Type
              </Text>
              <Text variant="body">{ink.isCartridge ? 'Cartridge' : 'Bottle'}</Text>
            </Stack>
            {!ink.isCartridge ? (
              <Stack gap="xs">
                <Text variant="small" color="textMuted" weight="600">
                  Size
                </Text>
                <Text variant="body">{ink.bottleSizeMl} ml</Text>
              </Stack>
            ) : null}
            {!ink.isCartridge ? (
              <Stack gap="xs">
                <Text variant="small" color="textMuted" weight="600">
                  Level
                </Text>
                <InkLevelDots level={ink.currentLevelPct} size={8} />
              </Stack>
            ) : null}
          </Stack>

          {ink.notes ? (
            <Stack gap="xs">
              <Text variant="small" color="textMuted" weight="600">
                Notes
              </Text>
              <Text variant="body">{ink.notes}</Text>
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
              testID="id-delete"
            >
              Delete ink
            </ButtonS>
          </Stack>
        </Stack>
      </ScrollView>

      <Modal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Stack gap="md">
          <Text variant="h2">Delete this ink?</Text>
          <Text variant="body" color="textMuted">
            The ink will be moved to Trash and removed from your collection.
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

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    padding: space.lg,
    width: layout.contentWidth,
  },
  flex: {
    flex: 1,
  },
  metaRow: {
    paddingVertical: space.sm,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  swatchBig: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  swatchInitial: {
    fontSize: 36,
  },
  swatchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.lg,
  },
});
