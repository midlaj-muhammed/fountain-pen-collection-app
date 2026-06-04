import { fireEvent, render, screen } from '@testing-library/react-native';

import { FAB } from './FAB';

describe('FAB', () => {
  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<FAB onPress={onPress} accessibilityLabel="Add pen" testID="fab" />);
    fireEvent.press(screen.getByTestId('fab'));
    expect(onPress).toHaveBeenCalled();
  });

  it('exposes accessibilityLabel for screen readers', () => {
    render(<FAB onPress={() => {}} accessibilityLabel="Add" testID="fab" />);
    expect(screen.getByTestId('fab').props.accessibilityLabel).toBe('Add');
  });
});
