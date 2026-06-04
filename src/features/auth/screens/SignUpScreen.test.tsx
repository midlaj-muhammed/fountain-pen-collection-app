import { fireEvent, render, screen } from '@testing-library/react-native';

import { SignUpScreen } from './SignUpScreen';

describe('SignUpScreen', () => {
  it('fires onSubmit with email + password when valid', () => {
    const onSubmit = jest.fn();
    render(<SignUpScreen onSubmit={onSubmit} onSignIn={() => {}} testID="u" />);
    fireEvent.changeText(screen.getByTestId('u-email'), 'bob@example.com');
    fireEvent.changeText(screen.getByTestId('u-password'), 'password123');
    fireEvent.press(screen.getByTestId('u-submit'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'bob@example.com', password: 'password123' }),
    );
  });

  it('rejects an invalid email', () => {
    const onSubmit = jest.fn();
    render(<SignUpScreen onSubmit={onSubmit} onSignIn={() => {}} testID="u" />);
    fireEvent.changeText(screen.getByTestId('u-email'), 'nope');
    fireEvent.changeText(screen.getByTestId('u-password'), 'password123');
    fireEvent.press(screen.getByTestId('u-submit'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
