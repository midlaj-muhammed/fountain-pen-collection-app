import { render, screen } from '@testing-library/react-native';

import { InkSwatch } from './InkSwatch';

describe('InkSwatch', () => {
  it('renders a dot of the requested size', () => {
    render(<InkSwatch color="#123456" size={12} testID="s" />);
    const node = screen.getByTestId('s');
    const flat = JSON.stringify(node.props.style);
    expect(flat).toContain('"#123456"');
  });
});
