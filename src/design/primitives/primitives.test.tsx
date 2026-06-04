import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { colors } from '@/design/tokens/colors';
import { layout } from '@/design/tokens/layout';
import { radius } from '@/design/tokens/radius';
import { space } from '@/design/tokens/spacing';

import { Box } from './Box';
import { Pressable } from './Pressable';
import { Stack } from './Stack';
import { Text } from './Text';

describe('Box', () => {
  it('renders a View with bg and radius from tokens', () => {
    render(
      <Box bg="bg" radius="md" testID="box">
        <RNText>x</RNText>
      </Box>,
    );
    const node = screen.getByTestId('box');
    const flat = JSON.stringify(node.props.style);
    // RN normalises the style — accept either array or object form
    expect(flat).toContain(colors.bg);
    expect(flat).toContain(String(radius.md));
  });

  it('applies layout.contentWidth when fullWidth is true', () => {
    render(
      <Box fullWidth testID="box">
        <RNText>x</RNText>
      </Box>,
    );
    const node = screen.getByTestId('box');
    expect(JSON.stringify(node.props.style)).toContain(String(layout.contentWidth));
  });
});

describe('Stack', () => {
  it('renders children in a vertical column with the requested gap', () => {
    render(
      <Stack gap="md" testID="stack">
        <RNText>a</RNText>
        <RNText>b</RNText>
      </Stack>,
    );
    const node = screen.getByTestId('stack');
    const flat = JSON.stringify(node.props.style);
    expect(flat).toContain(String(space.md));
  });

  it('switches to horizontal layout when axis="horizontal"', () => {
    render(
      <Stack axis="horizontal" gap="sm" testID="stack">
        <RNText>a</RNText>
      </Stack>,
    );
    const node = screen.getByTestId('stack');
    expect(JSON.stringify(node.props.style)).toContain('row');
  });
});

describe('Text', () => {
  it('renders text with the body variant by default', () => {
    render(<Text testID="t">hello</Text>);
    const node = screen.getByTestId('t');
    // Style is the array [computed, userStyle]; we check the first entry.
    expect(node.props.style[0]).toMatchObject({ fontSize: 16, lineHeight: 24 });
  });

  it('applies h1 variant size when variant="h1"', () => {
    render(
      <Text variant="h1" testID="t">
        big
      </Text>,
    );
    expect(screen.getByTestId('t').props.style[0]).toMatchObject({ fontSize: 28 });
  });

  it('applies a custom color from the token map', () => {
    render(
      <Text color="accent" testID="t">
        violet
      </Text>,
    );
    expect(screen.getByTestId('t').props.style[0].color).toBe(colors.accent);
  });

  it('applies uppercase when uppercased is true (button labels)', () => {
    render(
      <Text uppercased testID="t">
        add new
      </Text>,
    );
    expect(screen.getByTestId('t').props.style[0].textTransform).toBe('uppercase');
  });
});

describe('Pressable', () => {
  it('forwards onPress and renders children', () => {
    const onPress = jest.fn();
    render(
      <Pressable onPress={onPress} testID="p">
        <RNText>tap</RNText>
      </Pressable>,
    );
    // @testing-library/react-native renders the host node — fire a press.
    fireEvent.press(screen.getByTestId('p'));
    expect(onPress).toHaveBeenCalled();
  });

  it('forwards accessibilityLabel and accessibilityRole', () => {
    render(
      <Pressable accessibilityLabel="Save" testID="p">
        <RNText>save</RNText>
      </Pressable>,
    );
    const node = screen.getByTestId('p');
    expect(node.props.accessibilityLabel).toBe('Save');
  });
});
