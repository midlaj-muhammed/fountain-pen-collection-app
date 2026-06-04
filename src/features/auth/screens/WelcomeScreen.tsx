/* eslint-disable react-native/no-raw-text */
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { space } from '@/design/tokens/spacing';

export type WelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
  testID?: string;
};

/**
 * 3-slide value-prop intro. MVP shows the brand + 1 CTA + sign-in link;
 * the slides are a P2.4 polish item.
 */
export function WelcomeScreen({ onGetStarted, onSignIn, testID }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <Stack flex={1} justify="space-between" style={styles.body}>
        <View>
          <Text variant="display" color="accent" style={styles.title}>
            MyPen
          </Text>
          <Text variant="h2" color="text" style={styles.subtitle}>
            Catalog your pens and inks. Log your writing.
          </Text>
        </View>
        <Stack gap="md">
          <ButtonS onPress={onGetStarted} fullWidth>
            Get started
          </ButtonS>
          <ButtonS onPress={onSignIn} variant="ghost" fullWidth>
            I already have an account — sign in
          </ButtonS>
        </Stack>
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: space.xl,
    paddingHorizontal: space.lg,
  },
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  subtitle: {
    marginTop: space.md,
    width: layout.contentWidth,
  },
  title: {
    marginTop: space.xxl,
    width: layout.contentWidth,
  },
});
