import { render, screen } from '@testing-library/react-native';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the photo URL when provided', () => {
    render(<Avatar photoURL="https://example.com/me.png" displayName="Alice" testID="a" />);
    const node = screen.getByTestId('a');
    expect(node.props.accessibilityLabel).toContain('Alice');
  });

  it('falls back to initials when no photoURL is provided', () => {
    render(<Avatar displayName="Bob Middle Carpenter" testID="a" />);
    expect(screen.getByText('BC')).toBeTruthy();
  });

  it('falls back to a single character when only one name part is given', () => {
    render(<Avatar displayName="Madonna" testID="a" />);
    expect(screen.getByText('M')).toBeTruthy();
  });
});
