import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { Modal } from './Modal';

describe('Modal', () => {
  it('renders children when visible', () => {
    render(
      <Modal visible onClose={() => {}} testID="m">
        <RNText testID="content">content</RNText>
      </Modal>,
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('does not render children when not visible', () => {
    render(
      <Modal visible={false} onClose={() => {}} testID="m">
        <RNText testID="content">content</RNText>
      </Modal>,
    );
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal visible onClose={onClose} testID="m">
        <RNText>x</RNText>
      </Modal>,
    );
    fireEvent.press(screen.getByTestId('m-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
