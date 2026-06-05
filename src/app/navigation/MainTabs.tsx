import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Edit3, Calendar as CalIcon, Heart, Settings as SettingsIcon, Feather } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';
import { HomeStack } from '@/features/home/navigation/HomeStack';
import { InkStack } from '@/features/inks/navigation/InkStack';
import { SettingsStack } from '@/features/settings/navigation/SettingsStack';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens — replaced by real feature screens as P3 ships.
function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text variant="h2" color="accent">
        {title}
      </Text>
      <Text variant="body" color="textMuted" center>
        Coming soon.
      </Text>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const Icon =
            route.name === 'Pens'
              ? Edit3
              : route.name === 'Inks'
                ? Feather
                : route.name === 'Calendar'
                  ? CalIcon
                  : route.name === 'Wishlist'
                    ? Heart
                    : SettingsIcon;
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Pens" component={HomeStack} />
      <Tab.Screen name="Inks" component={InkStack} />
      <Tab.Screen name="Calendar">
        {() => <Placeholder title="Calendar" />}
      </Tab.Screen>
      <Tab.Screen name="Wishlist">
        {() => <Placeholder title="Wishlist" />}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
  },
});
