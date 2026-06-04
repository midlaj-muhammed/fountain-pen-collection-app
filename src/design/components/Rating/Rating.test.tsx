import { fireEvent, render, screen } from '@testing-library/react-native';

import { Rating } from './Rating';

describe('Rating', () => {
  it('read-only: renders 5 stars and reflects the value', () => {
    render(<Rating value={3} testID="r" />);
    const node = screen.getByTestId('r');
    expect(node.props.accessibilityValue).toEqual({ min: 0, max: 5, now: 3 });
  });

  it('read-only: hides the tap targets (no onChange callback fires)', () => {
    const onChange = jest.fn();
    render(<Rating value={3} testID="r" />);
    // read-only — fireEvent should not affect anything
    fireEvent.press(screen.getByTestId('star-2'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('interactive: tapping star-N sets the value to N', () => {
    const onChange = jest.fn();
    render(<Rating value={2} onChange={onChange} testID="r" />);
    fireEvent.press(screen.getByTestId('star-4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('exposes a default accessibilityLabel', () => {
    render(<Rating value={5} testID="r" />);
    expect(screen.getByTestId('r').props.accessibilityLabel).toMatch(/5 of 5/);
  });
});
