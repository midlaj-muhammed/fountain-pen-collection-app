import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | undefined;
  helper?: string | undefined;
  testID?: string | undefined;
};

/**
 * Token-styled text input. Supports a label, an inline error, an optional
 * helper line, and `secureTextEntry` for passwords. Focus state changes the
 * border colour to the accent.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helper, testID, ...inputProps },
  ref,
) {
  return (
    <View style={styles.wrap}>
      <Text variant="small" color="textMuted" weight="600" style={styles.label}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        testID={testID}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? (
        <Text variant="small" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" color="textMuted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  helper: {
    marginTop: space.xs,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  label: {
    marginBottom: space.xs,
  },
  wrap: {
    width: '100%',
  },
});
