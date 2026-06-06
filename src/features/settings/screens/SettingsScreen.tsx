/* eslint-disable react-native/no-raw-text, react-native/no-color-literals */
import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/app/providers/ThemeProvider';
import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Chip } from '@/design/components/Chip/Chip';
import { Modal } from '@/design/components/Modal/Modal';
import { SectionHeader } from '@/design/components/SectionHeader/SectionHeader';
import { Skeleton } from '@/design/components/Skeleton/Skeleton';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';
import { useUpdateUser, useUser } from '@/features/profile/api/queries';
import type { UserSettings } from '@/types/domain';

export type SettingsScreenProps = {
  uid: string | null;
  onBack: () => void;
  onOpenProfile: () => void;
  onSignOut?: () => void;
  onOpenDeleteAccount?: () => void;
  testID?: string;
};

const THEMES: { value: UserSettings['theme']; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const FONT_SIZES: { value: UserSettings['fontSize']; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const HOURS: number[] = Array.from({ length: 24 }, (_, h) => h);

// App version pulled from app.json via expo-constants. Falls back to
// '0.0.0' / '0' in unit tests where the runtime native module is
// stubbed and returns null.
const appVersion: string =
  (Constants.expoConfig?.version as string | undefined) ?? '0.0.0';
const appBuild: string =
  // expoConfig doesn't carry Android versionCode / iOS buildNumber
  // directly, but expo-constants exposes platform-specific config.
  String(
    (Constants as unknown as { expoConfig?: { android?: { versionCode?: number }; ios?: { buildNumber?: string } } })
      .expoConfig?.android?.versionCode ??
      (Constants as unknown as { expoConfig?: { ios?: { buildNumber?: string } } })
        .expoConfig?.ios?.buildNumber ??
      '0',
  );

/**
 * Settings screen. Lets the user adjust theme, font size, daily
 * reminder (with hour picker), reorder alerts, sign out, and open
 * the Delete account flow. Every change persists to the user doc
 * via useUpdateUser so the rest of the app re-reads it from cache.
 */
export function SettingsScreen({
  uid,
  onBack: _onBack,
  onOpenProfile,
  onSignOut,
  onOpenDeleteAccount,
  testID,
}: SettingsScreenProps) {
  const { data: user, isLoading } = useUser(uid);
  const updateUser = useUpdateUser(uid);
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [hourPickerOpen, setHourPickerOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.safe} testID={testID}>
        <View style={styles.body}>
          <SectionHeader title="Settings" />
          <Stack gap="md">
            <Skeleton variant="row" />
            <Skeleton variant="text" lines={5} />
          </Stack>
        </View>
      </SafeAreaView>
    );
  }

  const settings = user.settings;
  const patch = (next: Partial<UserSettings>) =>
    updateUser.mutateAsync({ settings: { ...settings, ...next } });

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title="Settings" />
        <Stack flex={1} gap="md" style={styles.bodyStack}>
          <Row
            label="Profile"
            value={user.displayName}
            onPress={onOpenProfile}
            testID={`${testID}-profile`}
          />

          <Stack gap="sm">
            <SectionTitle>Appearance</SectionTitle>
            <ChipRow
              label="Theme"
              chips={THEMES.map((t) => ({
                label: t.label,
                // Active state comes from the live theme hook (which
                // reflects MMKV + OS), not just the Firestore doc —
                // otherwise the chip won't reflect the change until
                // the query re-fetches.
                active: themeMode === t.value,
                onPress: () => {
                  setThemeMode(t.value);
                  // Mirror to Firestore for cross-device sync.
                  // Best-effort; the local cache is the truth that
                  // matters for this device.
                  patch({ theme: t.value }).catch(() => undefined);
                },
              }))}
              {...(themeMode === 'system'
                ? { hint: 'Following your device’s appearance setting.' }
                : {})}
            />
            <ChipRow
              label="Font size"
              chips={FONT_SIZES.map((f) => ({
                label: f.label,
                active: settings.fontSize === f.value,
                onPress: () => patch({ fontSize: f.value }),
              }))}
            />
          </Stack>

          <Stack gap="sm">
            <SectionTitle>Reminders</SectionTitle>
            <ToggleRow
              label="Daily reminder"
              value={settings.reminderEnabled}
              onValueChange={(v) => patch({ reminderEnabled: v })}
              testID={`${testID}-reminder`}
            />
            {settings.reminderEnabled ? (
              <Pressable
                onPress={() => setHourPickerOpen(true)}
                testID={`${testID}-hour`}
                style={styles.hourRow}
              >
                <Text variant="body">Reminder hour</Text>
                <Text variant="body" weight="600" color="accent">
                  {String(settings.reminderHour).padStart(2, '0')}:00
                </Text>
              </Pressable>
            ) : null}
            <ToggleRow
              label="Reorder alerts"
              hint="Notify when an ink level drops below 20% and you haven't used it in 14 days"
              value={settings.reorderAlertEnabled}
              onValueChange={(v) => patch({ reorderAlertEnabled: v })}
              testID={`${testID}-reorder`}
            />
          </Stack>

          <Stack gap="sm">
            <SectionTitle>Account</SectionTitle>
            {onSignOut ? (
              <ButtonS onPress={onSignOut} variant="secondary" fullWidth testID={`${testID}-signout`}>
                Sign out
              </ButtonS>
            ) : null}
            {onOpenDeleteAccount ? (
              <ButtonS
                onPress={onOpenDeleteAccount}
                variant="ghost"
                fullWidth
                testID={`${testID}-delete-account`}
              >
                Delete account
              </ButtonS>
            ) : null}
          </Stack>

          <Stack gap="sm">
            <SectionTitle>About</SectionTitle>
            <View style={styles.aboutCard}>
              <Stack gap="xs">
                <Text variant="body" weight="600">
                  MyPen
                </Text>
                <Text variant="small" color="textMuted">
                  Version {appVersion} ({appBuild})
                </Text>
                <Text variant="caption" color="textMuted">
                  A field journal for fountain pen enthusiasts — track every
                  pen, ink, and writing session in one place.
                </Text>
              </Stack>
            </View>
            <Pressable
              style={styles.aboutRow}
              onPress={() => {
                /* No-op: opens OSS licenses in a future update. */
              }}
              testID={`${testID}-licenses`}
            >
              <Text variant="body" weight="600">
                Open-source licenses
              </Text>
              <Text variant="small" color="textMuted">
                Tap to view
              </Text>
            </Pressable>
            <Pressable
              style={styles.aboutRow}
              onPress={() => {
                /* No-op: opens privacy policy in a future update. */
              }}
              testID={`${testID}-privacy`}
            >
              <Text variant="body" weight="600">
                Privacy policy
              </Text>
              <Text variant="small" color="textMuted">
                Tap to view
              </Text>
            </Pressable>
          </Stack>
        </Stack>
      </ScrollView>

      <Modal visible={hourPickerOpen} onClose={() => setHourPickerOpen(false)}>
        <Stack gap="md">
          <Text variant="h2">Reminder hour</Text>
          <View style={styles.hourGrid}>
            {HOURS.map((h) => (
              <Pressable
                key={h}
                onPress={() => {
                  patch({ reminderHour: h });
                  setHourPickerOpen(false);
                }}
                style={[
                  styles.hourCell,
                  settings.reminderHour === h && styles.hourCellActive,
                ]}
              >
                <Text
                  variant="small"
                  weight="600"
                  color={settings.reminderHour === h ? 'textInverse' : 'text'}
                >
                  {String(h).padStart(2, '0')}:00
                </Text>
              </Pressable>
            ))}
          </View>
        </Stack>
      </Modal>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  onPress,
  testID,
}: {
  label: string;
  value: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable onPress={onPress} testID={testID} style={styles.row}>
      <Stack gap="xs" style={styles.flex}>
        <Text variant="caption" color="textMuted" weight="600">
          {label}
        </Text>
        <Text variant="body" weight="600">
          {value}
        </Text>
      </Stack>
    </Pressable>
  );
}

function ChipRow({
  label,
  chips,
  hint,
}: {
  label: string;
  chips: { label: string; active: boolean; onPress: () => void }[];
  hint?: string;
}) {
  return (
    <Stack gap="xs">
      <Text variant="small" color="textMuted" weight="600">
        {label}
      </Text>
      <View style={styles.chipsRow}>
        {chips.map((c) => (
          <Chip key={c.label} label={c.label} active={c.active} onPress={c.onPress} />
        ))}
      </View>
      {hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  testID,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      testID={testID}
      style={styles.row}
    >
      <Stack gap="xs" style={styles.flex}>
        <Text variant="body" weight="600">
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color="textMuted">
            {hint}
          </Text>
        ) : null}
      </Stack>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="caption" color="textMuted" weight="700">
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  aboutCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.md,
  },
  aboutRow: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  body: {
    padding: space.lg,
  },
  bodyStack: {
    marginTop: space.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
  hourCell: {
    alignItems: 'center',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    width: 64,
  },
  hourCellActive: {
    backgroundColor: colors.accent,
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  hourRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
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
