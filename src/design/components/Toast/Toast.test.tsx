import { render, screen } from '@testing-library/react-native';

import { colors } from '@/design/tokens/colors';

import { Toast } from './Toast';

describe('Toast', () => {
  it('renders the message', () => {
    render(<Toast message="Saved" testID="t" />);
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('applies success colour by default', () => {
    render(<Toast message="Saved" testID="t" />);
    const node = screen.getByTestId('t');
    expect(JSON.stringify(node.props.style)).toContain(colors.success);
  });

  it('applies error colour when kind="error"', () => {
    render(<Toast message="Failed" kind="error" testID="t" />);
    expect(JSON.stringify(screen.getByTestId('t').props.style)).toContain(colors.danger);
  });
});
