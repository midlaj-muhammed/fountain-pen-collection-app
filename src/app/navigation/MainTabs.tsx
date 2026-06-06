import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Edit3, Calendar as CalIcon, Heart, Settings as SettingsIcon, Feather } from 'lucide-react-native';

import { colors } from '@/design/tokens/colors';
import { CalendarStack } from '@/features/calendar/navigation/CalendarStack';
import { HomeStack } from '@/features/home/navigation/HomeStack';
import { InkStack } from '@/features/inks/navigation/InkStack';
import { SettingsStack } from '@/features/settings/navigation/SettingsStack';
import { WishlistStack } from '@/features/wishlist/navigation/WishlistStack';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

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
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Wishlist" component={WishlistStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}
