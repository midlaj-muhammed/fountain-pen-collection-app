import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { env } from '@/config/env';
import { OfflineBanner } from '@/design/components/OfflineBanner/OfflineBanner';
import { colors } from '@/design/tokens/colors';
import { ToastHost } from '@/lib/toast/toast';

import { RootNavigator } from './navigation/RootNavigator';
import {
  AuthProvider,
  NetInfoProvider,
  QueryProvider,
  ThemeProvider,
  useIsOnline,
} from './providers';

/**
 * Calls `GoogleSignin.configure()` once at app start so the native
 * module has the web OAuth client id it needs to (a) run the OS
 * account chooser and (b) hand back an idToken that Firebase Auth
 * will accept. Without this, `GoogleSignin.signIn()` throws.
 *
 * Kept as a tiny dedicated component (not inline in App) so it can
 * be tested in isolation. See docs/google-signin-p4.md.
 */
function GoogleSigninConfigurator() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);
  return null;
}

/**
 * Root app component. Wires providers in the order: Theme → Query → Auth → NetInfo.
 * The actual navigation tree lives in RootNavigator. ToastHost wraps
 * the navigator so any screen mounted by the navigator can call
 * useToast().
 */
export function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NetInfoProvider>
                <SafeAreaView style={styles.safe} edges={['top']}>
                  <StatusBar style="dark" />
                  <GoogleSigninConfigurator />
                  <OfflineBannerHost />
                  <ToastHost>
                    <RootNavigator />
                  </ToastHost>
                </SafeAreaView>
              </NetInfoProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Tiny adapter so the OfflineBanner can read from NetInfoProvider. */
function OfflineBannerHost() {
  const isOnline = useIsOnline();
  return <OfflineBanner online={isOnline} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { backgroundColor: colors.bg, flex: 1 },
});
