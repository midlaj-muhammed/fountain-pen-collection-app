import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { createPen, updatePen, type PenInput } from '@/features/pens/api/pens';
import { PenForm } from '@/features/pens/components/PenForm';
import { PenDetailScreen } from '@/features/pens/screens/PenDetailScreen';
import { PenListScreen } from '@/features/pens/screens/PenListScreen';

import type { PenStackParamList } from './types';

const Stack = createNativeStackNavigator<PenStackParamList>();

/**
 * The Pens tab's native stack. Lives inside MainTabs.Pens. Owns the
 * create/update form submission calls; list/detail pass navigation up
 * to the navigator.
 */
export function PenStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="PenList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="PenList">
        {({ navigation }) => (
          <PenListScreen
            uid={uid}
            onAddPen={() => navigation.navigate('PenForm', { penId: undefined })}
            onOpenPen={(penId) => navigation.navigate('PenDetail', { penId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PenDetail">
        {({ navigation, route }) => (
          <PenDetailScreen
            uid={uid}
            penId={route.params.penId}
            onEdit={() => navigation.navigate('PenForm', { penId: route.params.penId })}
            onDelete={() => navigation.goBack()}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PenForm" options={{ presentation: 'modal' }}>
        {({ navigation, route }) => (
          <PenForm
            onCancel={() => navigation.goBack()}
            onSubmit={async (values) => {
              const input: PenInput = {
                brand: values.brand,
                model: values.model,
                nib: {
                  size: values.nibSize,
                  material: values.nibMaterial,
                  customLabel: values.nibCustomLabel,
                },
                color: values.color,
                photoURL: null,
                acquiredAt: null,
                retired: false,
                currentInkId: null,
                notes: values.notes,
                totalSessions: 0,
              };
              if (route.params.penId) {
                await updatePen(uid!, route.params.penId, input);
              } else {
                await createPen(uid!, input);
              }
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
