import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { createInk, updateInk, type InkInput } from '@/features/inks/api/inks';
import { InkForm } from '@/features/inks/components/InkForm';
import { InkDetailScreen } from '@/features/inks/screens/InkDetailScreen';
import { InkListScreen } from '@/features/inks/screens/InkListScreen';

import type { InkStackParamList } from './types';

const Stack = createNativeStackNavigator<InkStackParamList>();

/**
 * The Inks tab's native stack. Lives inside MainTabs.Inks. Owns the
 * create/update form submission calls; list/detail pass navigation up
 * to the navigator.
 */
export function InkStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="InkList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="InkList">
        {({ navigation }) => (
          <InkListScreen
            uid={uid}
            onAddInk={() => navigation.navigate('InkForm', { inkId: undefined })}
            onOpenInk={(inkId) => navigation.navigate('InkDetail', { inkId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InkDetail">
        {({ navigation, route }) => (
          <InkDetailScreen
            uid={uid}
            inkId={route.params.inkId}
            onEdit={() => navigation.navigate('InkForm', { inkId: route.params.inkId })}
            onDelete={() => navigation.goBack()}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InkForm" options={{ presentation: 'modal' }}>
        {({ navigation, route }) => (
          <InkForm
            onCancel={() => navigation.goBack()}
            onSubmit={async (values) => {
              const input: InkInput = {
                brand: values.brand,
                name: values.name,
                colorHex: values.colorHex,
                colorName: values.colorName,
                bottleSizeMl: values.bottleSizeMl,
                currentLevelPct: values.currentLevelPct,
                isCartridge: values.isCartridge,
                photoURL: null,
                acquiredAt: null,
                empty: false,
                totalSessions: 0,
                lastUsedAt: null,
                notes: values.notes,
              };
              if (route.params.inkId) {
                await updateInk(uid!, route.params.inkId, input);
              } else {
                await createInk(uid!, input);
              }
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
