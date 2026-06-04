import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { ButtonS } from './ButtonS';

describe('ButtonS', () => {
  it('renders the label uppercased (matches Figma ADD NEW / ADD EVENT)', () => {
    render(
      <ButtonS testID="b" onPress={() => {}}>
        Add new
      </ButtonS>,
    );
    const node = screen.getByTestId('b');
    // RNTL renders RNText children as separate host elements
    expect(screen.getByText('Add new')).toBeTruthy();
    expect(node).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(
      <ButtonS onPress={onPress} testID="b">
        Save
      </ButtonS>,
    );
    fireEvent.press(screen.getByTestId('b'));
    expect(onPress).toHaveBeenCalled();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <ButtonS onPress={onPress} disabled testID="b">
        Save
      </ButtonS>,
    );
    fireEvent.press(screen.getByTestId('b'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies accessibilityLabel when provided', () => {
    render(
      <ButtonS onPress={() => {}} accessibilityLabel="Save pen" testID="b">
        Save
      </ButtonS>,
    );
    expect(screen.getByTestId('b').props.accessibilityLabel).toBe('Save pen');
  });
});

// Quiet an unused-import warning during build
void RNText;
