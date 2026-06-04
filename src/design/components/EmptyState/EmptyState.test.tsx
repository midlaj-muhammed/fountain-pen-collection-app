import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and body', () => {
    render(
      <EmptyState
        title="No pens yet"
        body="Add your first pen to start tracking your collection."
        testID="es"
      />,
    );
    expect(screen.getByText('No pens yet')).toBeTruthy();
    expect(screen.getByText(/Add your first pen/)).toBeTruthy();
  });

  it('renders an action button when provided and fires onPress', () => {
    const onPress = jest.fn();
    render(
      <EmptyState
        title="No pens yet"
        body="Add one."
        action={{ label: 'Add pen', onPress }}
        testID="es"
      />,
    );
    fireEvent.press(screen.getByText('Add pen'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders an optional illustration slot', () => {
    render(
      <EmptyState
        title="t"
        body="b"
        illustration={<RNText testID="ill">pen-icon</RNText>}
        testID="es"
      />,
    );
    expect(screen.getByTestId('ill')).toBeTruthy();
  });
});
