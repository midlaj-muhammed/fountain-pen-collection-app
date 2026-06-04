import { StyleSheet, View } from 'react-native';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastProps = {
  message: string;
  kind?: ToastKind;
  testID?: string;
  accessibilityLabel?: string;
};

const kindToColor: Record<ToastKind, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.info,
};

/**
 * Top-of-screen toast. Auto-dismiss logic lives at the call site (3s).
 * For MVP we render an in-tree view; P3.x can swap in a global ToastHost.
 */
export function Toast({ message, kind = 'success', testID, accessibilityLabel }: ToastProps) {
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? message}
      accessibilityRole="alert"
      style={[styles.toast, { backgroundColor: kindToColor[kind] }]}
    >
      <Text color="textInverse" weight="600">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    borderRadius: radius.md,
    maxWidth: '90%',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
});
