import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/design/components/OfflineBanner/OfflineBanner';
import { colors } from '@/design/tokens/colors';

import { RootNavigator } from './navigation/RootNavigator';
import {
  AuthProvider,
  NetInfoProvider,
  QueryProvider,
  ThemeProvider,
  useIsOnline,
} from './providers';

/**
 * Root app component. Wires providers in the order: Theme → Query → Auth → NetInfo.
 * The actual navigation tree lives in RootNavigator.
 */
export function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NetInfoProvider>
                <SafeAreaView style={styles.safe}>
                  <StatusBar style="dark" />
                  <OfflineBannerHost />
                  <RootNavigator />
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
