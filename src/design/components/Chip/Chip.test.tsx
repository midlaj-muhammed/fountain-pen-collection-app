import { fireEvent, render, screen } from '@testing-library/react-native';

import { Chip } from './Chip';

describe('Chip', () => {
  it('renders the label', () => {
    render(<Chip label="Bottles" onPress={() => {}} testID="c" />);
    expect(screen.getByText('Bottles')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Chip label="Bottles" onPress={onPress} testID="c" />);
    fireEvent.press(screen.getByTestId('c'));
    expect(onPress).toHaveBeenCalled();
  });
});
