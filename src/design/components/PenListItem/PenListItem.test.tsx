import { fireEvent, render, screen } from '@testing-library/react-native';

import { PenListItem } from './PenListItem';

const basePen = {
  id: 'p1',
  brand: 'Pilot',
  model: 'Capless',
  nibSize: 'F' as const,
  totalSessions: 12,
  lastUsedDaysAgo: 2,
  hasInkAlert: false,
};

describe('PenListItem', () => {
  it('renders the brand and model', () => {
    render(<PenListItem pen={basePen} onPress={() => {}} />);
    expect(screen.getByText('Pilot')).toBeTruthy();
    expect(screen.getByText('Capless')).toBeTruthy();
  });

  it('renders the usage count', () => {
    render(<PenListItem pen={basePen} onPress={() => {}} />);
    expect(screen.getByText(/12/)).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<PenListItem pen={basePen} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders a "last used X ago" line', () => {
    render(<PenListItem pen={basePen} onPress={() => {}} />);
    expect(screen.getByText(/2 days ago|Last used 2 days ago/)).toBeTruthy();
  });
});
