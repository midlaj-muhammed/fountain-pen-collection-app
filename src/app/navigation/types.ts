import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root stack — auth and main are sibling top-level destinations.
 * RootNavigator picks one based on auth state.
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Pens: undefined;
  Inks: undefined;
  Calendar: undefined;
  Wishlist: undefined;
  Settings: undefined;
};
