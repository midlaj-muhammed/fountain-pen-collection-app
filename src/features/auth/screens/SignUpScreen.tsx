/* eslint-disable react-native/no-raw-text */
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

import { useAuthForm, type FormErrors } from '../hooks/useAuthForm';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters'),
});

export type SignUpValues = z.infer<typeof schema>;

export type SignUpScreenProps = {
  onSubmit: (values: SignUpValues) => void;
  onSignIn: () => void;
  onSignUpWithGoogle?: () => void;
  testID?: string;
  errorMessage?: string;
};

export function SignUpScreen({
  onSubmit,
  onSignIn,
  onSignUpWithGoogle,
  testID,
  errorMessage,
}: SignUpScreenProps) {
  const form = useAuthForm();

  const handleSubmit = () => {
    form.startSubmit();
    const parsed = schema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'email' && !next.email) next.email = issue.message;
        if (issue.path[0] === 'password' && !next.password) next.password = issue.message;
      }
      form.setErrors(next);
      form.finishSubmit();
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <Stack flex={1} gap="lg" style={styles.body}>
        <Stack gap="xs">
          <Text variant="h1" color="accent">
            Create account
          </Text>
          <Text variant="body" color="textMuted">
            Save your collection to the cloud.
          </Text>
        </Stack>

        {errorMessage || form.errors.general ? (
          <Text variant="small" color="danger">
            {errorMessage ?? form.errors.general}
          </Text>
        ) : null}

        <Stack gap="md">
          <TextField
            label="Email"
            value={form.email}
            onChangeText={form.setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            error={form.errors.email}
            testID={`${testID}-email`}
          />
          <TextField
            label="Password"
            value={form.password}
            onChangeText={form.setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            error={form.errors.password}
            helper="At least 8 characters"
            testID={`${testID}-password`}
          />
        </Stack>

        <Stack gap="sm">
          <ButtonS
            onPress={handleSubmit}
            disabled={form.isSubmitting}
            fullWidth
            testID={`${testID}-submit`}
          >
            {form.isSubmitting ? 'Creating…' : 'Create account'}
          </ButtonS>
          {onSignUpWithGoogle ? (
            <ButtonS
              onPress={onSignUpWithGoogle}
              variant="secondary"
              fullWidth
              testID={`${testID}-google`}
            >
              Continue with Google
            </ButtonS>
          ) : null}
          <Pressable onPress={onSignIn} testID={`${testID}-signin-link`}>
            <Text variant="small" color="textMuted" center>
              Already have an account? Sign in
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
