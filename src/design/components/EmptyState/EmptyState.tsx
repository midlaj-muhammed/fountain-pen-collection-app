import { type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';

export type EmptyStateProps = {
  title: string;
  body?: string | undefined;
  illustration?: ReactNode | undefined;
  action?: { label: string; onPress: () => void } | undefined;
  style?: ViewStyle | undefined;
  testID?: string | undefined;
};

/**
 * Centered illustration + headline + body + primary CTA. Used everywhere we
 * have no data: "Add your first pen", "No sessions logged", etc.
 */
export function EmptyState({ title, body, illustration, action, style, testID }: EmptyStateProps) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="md"
      style={[styles.wrap, style]}
      testID={testID}
    >
      {illustration}
      <Text variant="h2" color="text" center>
        {title}
      </Text>
      {body ? (
        <Text variant="body" color="textMuted" center>
          {body}
        </Text>
      ) : null}
      {action ? (
        <ButtonS onPress={action.onPress} variant="primary" style={styles.cta}>
          {action.label}
        </ButtonS>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  cta: {
    marginTop: space.md,
    minWidth: 200,
  },
  wrap: {
    backgroundColor: colors.bg,
    flex: 1,
    padding: space.lg,
  },
});
