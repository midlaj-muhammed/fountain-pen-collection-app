import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import { Pressable } from '@/design/primitives/Pressable';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type ButtonSVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSSize = 'sm' | 'md' | 'lg';

export type ButtonSProps = {
  children: ReactNode;
  onPress: () => void;
  variant?: ButtonSVariant | undefined;
  size?: ButtonSSize | undefined;
  disabled?: boolean | undefined;
  fullWidth?: boolean | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  testID?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
};

const sizeToHeight: Record<ButtonSSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

const sizeToPaddingX: Record<ButtonSSize, number> = {
  sm: space.md,
  md: space.lg,
  lg: space.lg,
};

/**
 * Primary CTA button. Labels render uppercase with letter-spacing to match
 * Figma's "ADD NEW" / "ADD EVENT" buttons.
 */
export function ButtonS({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  fullWidth,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ButtonSProps) {
  const bg = variant === 'primary' ? colors.accent : variant === 'secondary' ? colors.bg : 'transparent';
  const borderColor = variant === 'secondary' ? colors.accent : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderRadius: radius.md,
          height: sizeToHeight[size],
          paddingHorizontal: sizeToPaddingX[size],
          alignItems: 'center',
          justifyContent: 'center',
        },
        fullWidth ? { alignSelf: 'stretch' } : null,
        style,
      ]}
    >
      <Text variant="button" color={variant === 'primary' ? 'textInverse' : 'accent'} uppercased>
        {children}
      </Text>
    </Pressable>
  );
}
