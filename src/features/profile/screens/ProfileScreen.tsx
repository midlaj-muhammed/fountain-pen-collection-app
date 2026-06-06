/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/design/components/Avatar/Avatar';
import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { TextField } from '@/design/components/TextField/TextField';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useUpdateUser, useUser } from '@/features/profile/api/queries';

export type ProfileScreenProps = {
  uid: string | null;
  onBack: () => void;
  testID?: string;
};

/**
 * Profile screen. Read-only view of email + plan; editable display
 * name. Avatar upload is left for a v1.x polish pass (Storage rules
 * need to be deployed first).
 */
export function ProfileScreen({ uid, onBack, testID }: ProfileScreenProps) {
  const { data: user, isLoading } = useUser(uid);
  const updateUser = useUpdateUser(uid);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader title="Profile" />
          <Stack gap="md">
            <Skeleton variant="row" />
            <Skeleton variant="text" lines={5} />
          </Stack>
        </View>
      </SafeAreaView>
    );
  }

  const startEdit = () => {
    setName(user.displayName);
    setEditing(true);
  };
  const cancelEdit = () => {
    setName(user.displayName);
    setEditing(false);
  };
  const save = async () => {
    if (name.trim() && name.trim() !== user.displayName) {
      await updateUser.mutateAsync({ displayName: name.trim() });
    }
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title="Profile" />
        <Stack flex={1} gap="lg" style={styles.bodyStack}>
          <View style={styles.header}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <Avatar displayName={user.displayName} size={64} />
            )}
            <View style={styles.flex}>
              {editing ? (
                <TextField
                  label="Display name"
                  value={name}
                  onChangeText={setName}
                  testID={`${testID}-name-input`}
                />
              ) : (
                <Text variant="h1" color="accent">
                  {user.displayName}
                </Text>
              )}
              <Text variant="small" color="textMuted">
                {user.email}
              </Text>
            </View>
          </View>

          <View style={styles.metaCard}>
            <Stack axis="horizontal" align="center" justify="space-between">
              <Stack gap="xs">
                <Text variant="caption" color="textMuted" weight="600">
                  Plan
                </Text>
                <Text variant="body" weight="600">
                  {user.plan === 'pro' ? 'Pro plan' : 'Free plan'}
                </Text>
              </Stack>
              {user.emailVerified ? (
                <View style={styles.verifiedPill}>
                  <Text variant="caption" weight="600" color="success">
                    Verified
                  </Text>
                </View>
              ) : null}
            </Stack>
          </View>

          <Stack gap="sm">
            {editing ? (
              <>
                <ButtonS onPress={save} variant="primary" fullWidth testID={`${testID}-save`}>
                  Save
                </ButtonS>
                <ButtonS onPress={cancelEdit} variant="ghost" fullWidth>
                  Cancel
                </ButtonS>
              </>
            ) : (
              <ButtonS onPress={startEdit} variant="secondary" fullWidth testID={`${testID}-edit`}>
                Edit name
              </ButtonS>
            )}
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              style={styles.backBtn}
            >
              <Text variant="small" weight="600" color="textMuted" center>
                Back
              </Text>
            </Pressable>
          </Stack>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: space.md,
  },
  body: {
    padding: space.lg,
  },
  bodyStack: {
    marginTop: space.md,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
  },
  metaCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.md,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  verifiedPill: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
});
