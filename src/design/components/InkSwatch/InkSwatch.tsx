import { StyleSheet, View } from 'react-native';

export type InkSwatchProps = {
  color: string; // hex
  size?: number;
  testID?: string;
  accessibilityLabel?: string;
};

/**
 * Small colored dot used before an ink name (e.g. "● Aquamarine").
 */
export function InkSwatch({ color, size = 12, testID, accessibilityLabel }: InkSwatchProps) {
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? `Ink color ${color}`}
      accessibilityRole="image"
      style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
