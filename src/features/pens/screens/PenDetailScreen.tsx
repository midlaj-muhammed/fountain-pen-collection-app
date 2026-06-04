/* eslint-disable react-native/no-raw-text */
import { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Modal } from '@/design/components/Modal/Modal';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useDeletePen, usePen } from '@/features/pens/api/queries';

export type PenDetailScreenProps = {
  uid: string | null;
  penId: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  testID?: string;
};

export function PenDetailScreen({
  uid,
  penId,
  onEdit,
  onDelete,
  onBack,
  testID,
}: PenDetailScreenProps) {
  const { data: pen, isLoading } = usePen(uid, penId);
  const deletePenMutation = useDeletePen(uid);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !pen) {
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
      await deletePenMutation.mutateAsync(penId);
      onDelete();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <Stack flex={1} gap="lg">
          <View style={styles.photoWrap}>
            {pen.photoURL ? (
              <Image source={{ uri: pen.photoURL }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text color="textMuted" weight="700" style={styles.photoInitials}>
                  {pen.brand[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
          </View>

          <Stack gap="xs">
            <Text variant="caption" color="textMuted">
              {pen.brand}
            </Text>
            <Text variant="h1" color="accent">
              {pen.model}
            </Text>
            <Text variant="small" color="textMuted">
              Nib: {pen.nib.size} · {pen.nib.material}
              {pen.nib.customLabel ? ` · ${pen.nib.customLabel}` : ''}
            </Text>
          </Stack>

          {pen.notes ? (
            <Stack gap="xs">
              <Text variant="small" color="textMuted" weight="600">
                Notes
              </Text>
              <Text variant="body">{pen.notes}</Text>
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
              testID="pd-delete"
            >
              Delete pen
            </ButtonS>
          </Stack>
        </Stack>
      </ScrollView>

      <Modal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Stack gap="md">
          <Text variant="h2">Delete this pen?</Text>
          <Text variant="body" color="textMuted">
            The pen will be moved to Trash and removed from your collection.
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
  photo: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.lg,
    height: 160,
    width: 160,
  },
  photoInitials: {
    fontSize: 48,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWrap: {
    alignItems: 'center',
    marginBottom: space.md,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
