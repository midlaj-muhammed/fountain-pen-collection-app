import { fireEvent, render, screen } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the brand title', () => {
    render(<WelcomeScreen onGetStarted={() => {}} onSignIn={() => {}} testID="w" />);
    expect(screen.getByText('MyPen')).toBeTruthy();
  });

  it('fires onGetStarted when the primary CTA is pressed', () => {
    const onGetStarted = jest.fn();
    render(<WelcomeScreen onGetStarted={onGetStarted} onSignIn={() => {}} testID="w" />);
    fireEvent.press(screen.getByText('Get started'));
    expect(onGetStarted).toHaveBeenCalled();
  });

  it('fires onSignIn when the secondary CTA is pressed', () => {
    const onSignIn = jest.fn();
    render(<WelcomeScreen onGetStarted={() => {}} onSignIn={onSignIn} testID="w" />);
    fireEvent.press(screen.getByText(/sign in/i));
    expect(onSignIn).toHaveBeenCalled();
  });
});
