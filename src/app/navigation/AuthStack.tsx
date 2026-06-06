import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import {
  ForgotPasswordScreen,
  SignInScreen,
  SignUpScreen,
  WelcomeScreen,
} from '@/features/auth/screens';
import {
  sendPasswordResetEmail,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/firebase';

import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Centralised error-toast for the auth flows. Kept here (not in
 * each screen) so the AuthStack owns the "what does a failed call
 * look like" UX in one place. The screens render the per-field
 * validation errors themselves.
 */
function showAuthError(prefix: string, err: unknown): void {
  const message = err instanceof Error ? err.message : 'Unexpected error';
  Alert.alert(prefix, message);
}

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, gestureEnabled: true }}
    >
      <Stack.Screen name="Welcome">
        {({ navigation }) => (
          <WelcomeScreen
            onGetStarted={() => navigation.navigate('SignUp')}
            onSignIn={() => navigation.navigate('SignIn')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignIn">
        {({ navigation }) => (
          <SignInScreen
            onSubmit={async ({ email, password }) => {
              // onAuthStateChanged (in AuthProvider) swaps the root
              // navigator on success, so we don't navigate here.
              try {
                await signInWithEmail(email, password);
              } catch (err) {
                showAuthError('Sign in failed', err);
                // Re-throw so the screen can reset its isSubmitting flag.
                throw err;
              }
            }}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
            onSignUp={() => navigation.navigate('SignUp')}
            onSignInWithGoogle={() => {
              /* Screen calls useAuthForm().signInWithGoogle internally;
                 onAuthStateChanged will swap the root navigator. */
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen
            onSubmit={async ({ email, password }) => {
              try {
                await signUpWithEmail(email, password);
              } catch (err) {
                showAuthError('Sign up failed', err);
                throw err;
              }
            }}
            onSignIn={() => navigation.navigate('SignIn')}
            onSignUpWithGoogle={() => {
              /* Screen calls useAuthForm().signInWithGoogle internally;
                 onAuthStateChanged will swap the root navigator. */
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            onSubmit={async (email) => {
              try {
                await sendPasswordResetEmail(email);
                Alert.alert(
                  'Check your inbox',
                  `We sent a password-reset link to ${email}.`,
                );
                navigation.goBack();
              } catch (err) {
                showAuthError('Could not send reset email', err);
                throw err;
              }
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
