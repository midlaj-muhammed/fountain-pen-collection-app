import { fireEvent, render, screen } from '@testing-library/react-native';

import { ForgotPasswordScreen } from './ForgotPasswordScreen';

describe('ForgotPasswordScreen', () => {
  it('fires onSubmit with the email when valid', () => {
    const onSubmit = jest.fn();
    render(<ForgotPasswordScreen onSubmit={onSubmit} onBack={() => {}} testID="f" />);
    fireEvent.changeText(screen.getByTestId('f-email'), 'alice@example.com');
    fireEvent.press(screen.getByText(/send reset link/i));
    expect(onSubmit).toHaveBeenCalledWith('alice@example.com');
  });

  it('rejects an invalid email', () => {
    const onSubmit = jest.fn();
    render(<ForgotPasswordScreen onSubmit={onSubmit} onBack={() => {}} testID="f" />);
    fireEvent.changeText(screen.getByTestId('f-email'), 'nope');
    fireEvent.press(screen.getByText(/send reset link/i));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fires onBack when the back link is pressed', () => {
    const onBack = jest.fn();
    render(<ForgotPasswordScreen onSubmit={() => {}} onBack={onBack} testID="f" />);
    fireEvent.press(screen.getByText(/back to sign in/i));
    expect(onBack).toHaveBeenCalled();
  });
});
