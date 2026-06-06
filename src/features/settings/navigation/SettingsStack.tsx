import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { DeleteAccountScreen } from '@/features/settings/screens/DeleteAccountScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';

import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * The Settings tab's native stack. Initial route is Settings; tapping
 * the Profile row drills into Profile; the "Delete account" button
 * opens DeleteAccount as a modal. Tapping the Settings tab again
 * returns to Settings.
 */
export function SettingsStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SettingsHome">
        {({ navigation }) => (
          <SettingsScreen
            uid={uid}
            onBack={() => navigation.goBack()}
            onOpenProfile={() => navigation.navigate('Profile')}
            onOpenDeleteAccount={() => navigation.navigate('DeleteAccount')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen uid={uid} onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="DeleteAccount" options={{ presentation: 'modal' }}>
        {({ navigation }) => (
          <DeleteAccountScreen
            uid={uid}
            onBack={() => navigation.goBack()}
            onDeleted={() => {
              // After deletion the AuthProvider will transition to
              // signedOut and the RootNavigator will route to the
              // AuthStack; the back navigation here is a safety
              // net for environments where the auth-state change
              // is delayed.
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
