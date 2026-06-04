import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/app/providers/AuthProvider';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

/**
 * Top-level navigator. Swaps between Auth and Main based on auth status.
 * During the initial Firebase auth-state resolution we show a splash.
 */
export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.splash}>
        <View style={styles.center}>
          <Text variant="display" color="accent">
            MyPen
          </Text>
          <ActivityIndicator color={colors.accent} style={styles.spinner} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {status === 'signedIn' ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
  splash: {
    backgroundColor: colors.bg,
    flex: 1,
  },
});
