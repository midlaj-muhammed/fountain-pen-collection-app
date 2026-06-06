/* eslint-disable react-native/no-raw-text */
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters'),
});

export type SignInValues = z.infer<typeof credentialsSchema>;

export type SignInScreenProps = {
  onSubmit: (values: SignInValues) => Promise<void> | void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSignInWithGoogle?: () => void;
  testID?: string;
  errorMessage?: string;
};

export function SignInScreen({
  onSubmit,
  onForgotPassword,
  onSignUp,
  onSignInWithGoogle,
  testID,
  errorMessage,
}: SignInScreenProps) {
  const form = useAuthForm();

  const handleSubmit = async () => {
    form.startSubmit();
    const parsed = credentialsSchema.safeParse({
      email: form.email,
      password: form.password,
    });
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
    // onSubmit is async and may throw (auth errors are surfaced via
    // Alert by the AuthStack). Always finish submitting so the button
    // doesn't stay disabled if the call rejects.
    try {
      await onSubmit(parsed.data);
    } catch {
      // Swallow — the caller already showed an Alert.
    } finally {
      form.finishSubmit();
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <Stack flex={1} gap="lg" style={styles.body}>
        <Stack gap="xs">
          <Text variant="h1" color="accent">
            Sign in
          </Text>
          <Text variant="body" color="textMuted">
            Welcome back. Sign in to sync your collection.
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
            textContentType="password"
            error={form.errors.password}
            testID={`${testID}-password`}
          />
          <Pressable onPress={onForgotPassword}>
            <Text variant="small" color="accent" weight="600">
              Forgot password?
            </Text>
          </Pressable>
        </Stack>

        <Stack gap="sm">
          <ButtonS
            onPress={handleSubmit}
            disabled={form.isSubmitting}
            fullWidth
            testID={`${testID}-submit`}
          >
            {form.isSubmitting ? 'Signing in…' : 'Sign in'}
          </ButtonS>
          {onSignInWithGoogle ? (
            <ButtonS
              onPress={form.signInWithGoogle}
              disabled={form.isSubmitting}
              variant="secondary"
              fullWidth
              testID={`${testID}-google`}
            >
              {form.isSubmitting ? 'Signing in…' : 'Continue with Google'}
            </ButtonS>
          ) : null}
          <Pressable onPress={onSignUp} testID={`${testID}-signup-link`}>
            <Text variant="small" color="textMuted" center>
              New here? Create an account
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
