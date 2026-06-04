import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useTheme } from './ThemeProvider';

function Probe() {
  const { theme, color } = useTheme();
  return (
    <>
      <Text testID="theme">{theme}</Text>
      <Text testID="accent">{color('accent')}</Text>
      <Text testID="bg">{color('bg')}</Text>
    </>
  );
}

describe('ThemeProvider', () => {
  it('defaults to light theme', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').children[0]).toBe('light');
    expect(screen.getByTestId('accent').children[0]).toBe('#6B4FE0');
    expect(screen.getByTestId('bg').children[0]).toBe('#FAF8F4');
  });

  it('swaps to dark tokens when theme="dark"', () => {
    render(
      <ThemeProvider theme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').children[0]).toBe('dark');
    expect(screen.getByTestId('accent').children[0]).toBe('#8A73E8');
    expect(screen.getByTestId('bg').children[0]).toBe('#0F0F10');
  });

  it('throws if useTheme is used outside a ThemeProvider', () => {
    // Suppress expected error logging
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
