import { render, screen } from '@testing-library/react-native';

import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    render(<OfflineBanner online testID="b" />);
    expect(screen.queryByTestId('b')).toBeNull();
  });

  it('renders an offline message when offline', () => {
    render(<OfflineBanner online={false} testID="b" />);
    expect(screen.getByText(/offline/i)).toBeTruthy();
  });
});
