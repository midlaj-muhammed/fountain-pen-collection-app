import { render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the title as a big bold heading', () => {
    render(<SectionHeader title="My Pens" testID="h" />);
    expect(screen.getByText('My Pens')).toBeTruthy();
  });

  it('renders a right slot when provided', () => {
    render(
      <SectionHeader
        title="My Pens"
        right={<RNText testID="r">sort by</RNText>}
        testID="h"
      />,
    );
    expect(screen.getByTestId('r')).toBeTruthy();
  });
});
