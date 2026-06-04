import { render, screen } from '@testing-library/react-native';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a row skeleton with an avatar block and a text column', () => {
    render(<Skeleton variant="row" testID="s" />);
    const node = screen.getByTestId('s');
    // row variant = 2 children: avatar block + column container
    expect(node.children).toHaveLength(2);
  });

  it('renders a text skeleton with the requested number of lines', () => {
    render(<Skeleton variant="text" lines={5} testID="s" />);
    const node = screen.getByTestId('s');
    expect(node.children).toHaveLength(5);
  });
});
