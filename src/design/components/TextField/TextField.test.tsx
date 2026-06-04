import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from './TextField';

describe('TextField', () => {
  it('renders the label', () => {
    render(<TextField label="Email" value="a@b.com" onChangeText={() => {}} testID="t" />);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('fires onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    render(<TextField label="Email" value="" onChangeText={onChangeText} testID="t" />);
    fireEvent.changeText(screen.getByTestId('t'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('displays an error message when error is set', () => {
    render(
      <TextField
        label="Email"
        value=""
        onChangeText={() => {}}
        error="Invalid email"
        testID="t"
      />,
    );
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('masks the input when secureTextEntry is true (password field)', () => {
    render(
      <TextField
        label="Password"
        value="hunter2"
        onChangeText={() => {}}
        secureTextEntry
        testID="t"
      />,
    );
    expect(screen.getByTestId('t').props.secureTextEntry).toBe(true);
  });
});
