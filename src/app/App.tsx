import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/design/tokens/colors';

import { AuthProvider, NetInfoProvider, QueryProvider, ThemeProvider, useIsOnline } from './providers';

/**
 * Root app component. Wires providers in the order: Theme → Query → Auth → NetInfo.
 * The real navigation tree lands in P2.1; for P0 we render a placeholder
 * so `pnpm ios` and `pnpm android` have something to show.
 */
export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <NetInfoProvider>
            <SafeAreaView style={styles.root}>
              <StatusBar style="dark" />
              <Placeholder />
            </SafeAreaView>
          </NetInfoProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

function Placeholder() {
  const isOnline = useIsOnline();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>MyPen</Text>
      <Text style={styles.subtitle}>Bootstrap OK · P0.1</Text>
      <Text style={styles.status}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  root: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  status: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 8,
  },
  title: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '700',
  },
});
