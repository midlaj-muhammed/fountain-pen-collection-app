import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';

export type AvatarSize = 24 | 32 | 48 | 64;

export type AvatarProps = {
  photoURL?: string | null;
  displayName?: string | null;
  size?: AvatarSize;
  testID?: string;
};

function initialsFromName(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({ photoURL, displayName, size = 48, testID }: AvatarProps) {
  if (photoURL) {
    return (
      <Image
        testID={testID}
        accessibilityLabel={`${displayName ?? 'User'} avatar`}
        source={{ uri: photoURL }}
        style={[styles.image, { width: size, height: size, borderRadius: radius.pill }]}
      />
    );
  }
  return (
    <View
      testID={testID}
      accessibilityLabel={`${displayName ?? 'User'} avatar`}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius.pill },
      ]}
    >
      <Text color="textInverse" weight="700">
        {initialsFromName(displayName)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    justifyContent: 'center',
  },
  image: {
    backgroundColor: colors.bgMuted,
  },
});
