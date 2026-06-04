import { fireEvent, render, screen } from '@testing-library/react-native';

import { SignInScreen } from './SignInScreen';

describe('SignInScreen', () => {
  it('fires onSubmit with email + password when the form is valid', () => {
    const onSubmit = jest.fn();
    render(
      <SignInScreen
        onSubmit={onSubmit}
        onForgotPassword={() => {}}
        onSignUp={() => {}}
        testID="s"
      />,
    );
    fireEvent.changeText(screen.getByTestId('s-email'), 'alice@example.com');
    fireEvent.changeText(screen.getByTestId('s-password'), 'password123');
    fireEvent.press(screen.getByTestId('s-submit'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@example.com', password: 'password123' }),
    );
  });

  it('shows validation errors for an invalid email', () => {
    const onSubmit = jest.fn();
    render(
      <SignInScreen
        onSubmit={onSubmit}
        onForgotPassword={() => {}}
        onSignUp={() => {}}
        testID="s"
      />,
    );
    fireEvent.changeText(screen.getByTestId('s-email'), 'not-an-email');
    fireEvent.changeText(screen.getByTestId('s-password'), 'password123');
    fireEvent.press(screen.getByTestId('s-submit'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation errors for a short password', () => {
    const onSubmit = jest.fn();
    render(
      <SignInScreen
        onSubmit={onSubmit}
        onForgotPassword={() => {}}
        onSignUp={() => {}}
        testID="s"
      />,
    );
    fireEvent.changeText(screen.getByTestId('s-email'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('s-password'), 'short');
    fireEvent.press(screen.getByTestId('s-submit'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fires onForgotPassword when the link is pressed', () => {
    const onForgotPassword = jest.fn();
    render(
      <SignInScreen
        onSubmit={() => {}}
        onForgotPassword={onForgotPassword}
        onSignUp={() => {}}
        testID="s"
      />,
    );
    fireEvent.press(screen.getByText(/forgot/i));
    expect(onForgotPassword).toHaveBeenCalled();
  });
});
