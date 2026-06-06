import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { CalendarScreen } from '@/features/calendar/screens/CalendarScreen';

import type { CalendarStackParamList } from './types';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

/**
 * The Calendar tab's native stack. Replaces the
 * "Coming soon." placeholder that was previously mounted
 * directly on the bottom tab. Today the stack has only the month
 * view; tapping a day-grouped session card is a no-op until the
 * Session detail screen exposes a navigation prop here.
 */
export function CalendarStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="CalendarMonth"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="CalendarMonth">
        {() => <CalendarScreen uid={uid} testID="calendar" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
