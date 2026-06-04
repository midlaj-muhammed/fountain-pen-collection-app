import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ForgotPasswordScreen,
  SignInScreen,
  SignUpScreen,
  WelcomeScreen,
} from '@/features/auth/screens';

import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

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
            onSubmit={() => {
              /* onAuthStateChanged will swap the root navigator */
            }}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
            onSignUp={() => navigation.navigate('SignUp')}
            onSignInWithGoogle={() => {
              /* onAuthStateChanged will swap the root navigator */
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen
            onSubmit={() => {
              /* onAuthStateChanged will swap the root navigator */
            }}
            onSignIn={() => navigation.navigate('SignIn')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            onSubmit={() => {
              /* handled by AuthProvider; just show sent message */
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
