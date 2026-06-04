import { type ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 'sheet' (default — slides from bottom) or 'dialog' (centered). */
  variant?: 'sheet' | 'dialog' | undefined;
  testID?: string | undefined;
};

/**
 * Bottom sheet (default) or centered dialog overlay. Backdrop press → onClose.
 * The actual slide animation is provided by RNModal; Reanimated can replace
 * it in a future iteration for springier motion.
 */
export function Modal({ visible, onClose, children, variant = 'sheet', testID }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={variant === 'sheet' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <Pressable
        testID={testID ? `${testID}-backdrop` : undefined}
        onPress={onClose}
        accessibilityLabel="Close"
        accessibilityRole="button"
        style={styles.backdrop}
      >
        <SafeAreaView pointerEvents="box-none" style={styles.safe}>
          {variant === 'sheet' ? (
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.sheet}
              testID={testID}
            >
              <View style={styles.grabber} />
              {children}
            </Pressable>
          ) : (
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.dialog}
              testID={testID}
            >
              {children}
            </Pressable>
          )}
        </SafeAreaView>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.scrim,
    flex: 1,
  },
  dialog: {
    alignSelf: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    margin: space.xl,
    maxWidth: '90%',
    padding: space.lg,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    marginBottom: space.md,
    width: 36,
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: space.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
});
