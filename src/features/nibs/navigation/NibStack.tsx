import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Timestamp } from 'firebase/firestore';

import { useAuth } from '@/app/providers/AuthProvider';
import { useCreateNibSwap } from '@/features/nibs/api/queries';
import { NibSwapForm } from '@/features/nibs/components/NibSwapForm';
import { NibSwapHistory } from '@/features/nibs/screens/NibSwapHistory';
import { usePen } from '@/features/pens/api/queries';

import type { NibStackParamList } from './types';

const Stack = createNativeStackNavigator<NibStackParamList>();

/**
 * Per-pen nib sub-stack. Lives inside HomeStack — opened from the
 * "Nibs" button on PenDetail. Initial route is NibHistory; the
 * NibForm route is a modal that pre-fills the "from" nib with the
 * pen's current nib.
 */
export function NibStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return (
    <Stack.Navigator
      initialRouteName="NibHistory"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="NibHistory">
        {({ navigation, route }) => (
          <NibSwapHistory
            uid={uid}
            penId={route.params.penId}
            onBack={() => navigation.goBack()}
            onAddSwap={() => navigation.navigate('NibForm', { penId: route.params.penId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NibForm" options={{ presentation: 'modal' }}>
        {({ navigation, route }) => (
          <NibFormRoute
            uid={uid}
            penId={route.params.penId}
            onCancel={() => navigation.goBack()}
            onDone={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

/**
 * Inner route component so we can call hooks (useCreateNibSwap,
 * usePen) at the top level. The stack.Screen render callback is
 * not a stable component boundary, so we wrap in a real component.
 */
function NibFormRoute({
  uid,
  penId,
  onCancel,
  onDone,
}: {
  uid: string | null;
  penId: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const createNibSwap = useCreateNibSwap(uid, penId);
  const { data: pen } = usePen(uid, penId);
  return (
    <NibSwapForm
      uid={uid}
      penId={penId}
      initialFromNib={pen?.nib}
      onCancel={onCancel}
      onSubmit={async (values) => {
        await createNibSwap.mutateAsync({
          penId,
          date: Timestamp.now() as never,
          fromNib: values.fromNib,
          toNib: values.toNib,
          notes: values.notes,
        });
        onDone();
      }}
    />
  );
}
