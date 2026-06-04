import { fireEvent, render, screen } from '@testing-library/react-native';

import { InkListItem } from './InkListItem';

const baseInk = {
  id: 'i1',
  brand: 'Pelikan',
  name: '4001',
  colorHex: '#2D5D3F',
  colorName: 'Dark Green',
  bottleSizeMl: 30,
  currentLevelPct: 60 as const,
  isCartridge: false,
};

describe('InkListItem (2-col grid card)', () => {
  it('renders the ink brand, name, and color name', () => {
    render(<InkListItem ink={baseInk} onPress={() => {}} />);
    expect(screen.getByText('Pelikan')).toBeTruthy();
    expect(screen.getByText('4001')).toBeTruthy();
    expect(screen.getByText('Dark Green')).toBeTruthy();
  });

  it('renders the bottle size', () => {
    render(<InkListItem ink={baseInk} onPress={() => {}} />);
    expect(screen.getByText('30 ml')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<InkListItem ink={baseInk} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('hides the level bar for cartridges', () => {
    render(<InkListItem ink={{ ...baseInk, isCartridge: true }} onPress={() => {}} />);
    // The "ml" line still shows, but the InkLevelDots is not rendered.
    // We assert on the absence of a level-bar accessibility label.
    expect(screen.queryByLabelText(/Ink level/)).toBeNull();
  });
});
