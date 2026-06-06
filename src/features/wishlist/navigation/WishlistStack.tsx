import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import {
  useCreateWishlistItem,
} from '@/features/wishlist/api/queries';
import { WishlistForm, type WishlistFormValues } from '@/features/wishlist/screens/WishlistForm';
import { WishlistListScreen } from '@/features/wishlist/screens/WishlistListScreen';

import type { WishlistStackParamList } from './types';

const Stack = createNativeStackNavigator<WishlistStackParamList>();

/**
 * The Wishlist tab's native stack. Owns the create mutation so
 * the form screen stays a presentational component.
 */
export function WishlistStack() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const create = useCreateWishlistItem(uid);

  return (
    <Stack.Navigator
      initialRouteName="WishlistList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="WishlistList">
        {({ navigation }) => (
          <WishlistListScreen
            uid={uid}
            onAdd={() => navigation.navigate('WishlistForm')}
            testID="wishlist"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="WishlistForm" options={{ presentation: 'modal' }}>
        {({ navigation }) => (
          <WishlistForm
            onCancel={() => navigation.goBack()}
            onSubmit={async (values: WishlistFormValues) => {
              await create.mutateAsync(values);
              navigation.goBack();
            }}
            testID="wishlist-form"
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
