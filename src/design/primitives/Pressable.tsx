import { type ReactNode } from 'react';
import {
  type AccessibilityProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
  Pressable as RNPressable,
} from 'react-native';

import { colors } from '@/design/tokens/colors';

export type PressableProps = {
  children?: ReactNode;
  testID?: string | undefined;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
    | undefined;
  onPress?: (() => void) | undefined;
  onLongPress?: (() => void) | undefined;
  disabled?: boolean | undefined;
} & Pick<
  AccessibilityProps,
  'accessibilityLabel' | 'accessibilityRole' | 'accessibilityHint' | 'accessibilityState'
>;

/**
 * Pressable with:
 *  - Built-in opacity feedback (0.6 on press)
 *  - Default accessibilityRole = 'button' (overridable)
 *  - Disabled state
 */
export function Pressable({
  children,
  testID,
  style,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}: PressableProps) {
  return (
    <RNPressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      style={(state) => {
        const computed: ViewStyle = { opacity: state.pressed ? 0.6 : 1 };
        if (disabled) computed.opacity = 0.4;
        const userStyle = typeof style === 'function' ? style(state) : style;
        return [computed, userStyle];
      }}
    >
      {children}
    </RNPressable>
  );
}

/** Re-export so consumers can read colors without importing again. */
export { colors };
