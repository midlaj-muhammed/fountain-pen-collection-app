import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { createInk, updateInk, type InkInput } from '@/features/inks/api/inks';
import { InkForm } from '@/features/inks/components/InkForm';
import { InkDetailScreen } from '@/features/inks/screens/InkDetailScreen';
import { InkListScreen } from '@/features/inks/screens/InkListScreen';
import { createPen, updatePen, type PenInput } from '@/features/pens/api/pens';
import { PenForm } from '@/features/pens/components/PenForm';
import { PenDetailScreen } from '@/features/pens/screens/PenDetailScreen';
import { PenListScreen } from '@/features/pens/screens/PenListScreen';

import { QuickLog } from '../components/QuickLog';
import { HomeScreen } from '../screens/HomeScreen';

import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * The Pens tab's native stack. Home is the initial route so users land
 * on the dashboard. From Home they can drill into PenList / InkList,
 * open a Pen or Ink detail, or open the Add/Edit form. Tapping the Pens
 * tab again returns to Home.
 */
export function HomeStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <>
            <HomeScreen
              uid={uid}
              onOpenPen={(penId) => navigation.navigate('PenDetail', { penId })}
              onOpenInk={(inkId) => navigation.navigate('InkDetail', { inkId })}
              onSeeAllPens={() => navigation.navigate('PenList')}
              onSeeAllInks={() => navigation.navigate('InkList')}
              testID="home"
            />
            <QuickLog uid={uid} onLogged={() => undefined} testID="ql" />
          </>
        )}
      </Stack.Screen>
      <Stack.Screen name="PenList">
        {({ navigation }) => (
          <PenListScreen
            uid={uid}
            onAddPen={() => navigation.navigate('PenForm', { penId: undefined })}
            onOpenPen={(penId) => navigation.navigate('PenDetail', { penId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InkList">
        {({ navigation }) => (
          <InkListScreen
            uid={uid}
            onAddInk={() => navigation.navigate('InkForm', { inkId: undefined })}
            onOpenInk={(inkId) => navigation.navigate('InkDetail', { inkId })}
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
