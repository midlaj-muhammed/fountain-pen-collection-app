import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { z } from 'zod';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { TextField } from '@/design/components/TextField/TextField';
import { Pressable } from '@/design/primitives/Pressable';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { space } from '@/design/tokens/spacing';

const emailSchema = z.string().email('Enter a valid email address');

export type ForgotPasswordScreenProps = {
  onSubmit: (email: string) => void;
  onBack: () => void;
  testID?: string;
  errorMessage?: string;
  sentMessage?: string;
};

export function ForgotPasswordScreen({
  onSubmit,
  onBack,
  testID,
  errorMessage,
  sentMessage,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setError(undefined);
    setSubmitting(true);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid email');
      setSubmitting(false);
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <Stack flex={1} gap="lg" style={styles.body}>
        <Stack gap="xs">
          <Text variant="h1" color="accent">
            Reset password
          </Text>
          <Text variant="body" color="textMuted">
            We’ll email you a link to choose a new password.
          </Text>
        </Stack>

        {errorMessage ? (
          <Text variant="small" color="danger">
            {errorMessage}
          </Text>
        ) : null}
        {sentMessage ? (
          <Text variant="small" color="success">
            {sentMessage}
          </Text>
        ) : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={error}
          testID={`${testID}-email`}
        />

        <Stack gap="sm">
          <ButtonS onPress={handleSubmit} disabled={submitting} fullWidth>
            {submitting ? 'Sending…' : 'Send reset link'}
          </ButtonS>
          <Pressable onPress={onBack}>
            <Text variant="small" color="textMuted" center>
              Back to sign in
            </Text>
          </Pressable>
        </Stack>
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    padding: space.lg,
    width: layout.contentWidth,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
