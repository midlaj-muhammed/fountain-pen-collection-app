import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';

export type OfflineBannerProps = {
  online: boolean;
  testID?: string | undefined;
};

/**
 * Top-of-screen thin banner shown when NetInfo reports offline.
 * Matches `figma-screens/Offline Headers@3x.png`.
 */
export function OfflineBanner({ online, testID }: OfflineBannerProps) {
  if (online) return null;
  return (
    <SafeAreaView edges={['top']} style={styles.safe} pointerEvents="none">
      <View testID={testID} style={styles.banner} accessibilityRole="alert">
        <Text variant="small" color="textInverse" weight="600">
          You’re offline — changes will sync when reconnected.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  safe: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
});
