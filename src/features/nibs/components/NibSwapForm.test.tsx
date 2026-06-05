/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';

import { NibSwapForm } from './NibSwapForm';

const TEST_UID = 'alice-uid';
const TEST_PEN_ID = 'pen-1';

function renderIsolated(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('NibSwapForm', () => {
  it('renders empty fields for a new swap', () => {
    renderIsolated(
      <NibSwapForm
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onSubmit={async () => {}}
        onCancel={() => {}}
        testID="ns"
      />,
    );
    // Default nib size: M (matches nib initialiser)
    expect(screen.getByTestId('ns-from-size-M').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('ns-to-size-M').props.accessibilityState?.selected).toBe(true);
  });

  it('pre-fills fromNib with the pen default nib when provided', () => {
    renderIsolated(
      <NibSwapForm
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        initialFromNib={{ size: 'F', material: 'gold', customLabel: null }}
        onSubmit={async () => {}}
        onCancel={() => {}}
        testID="ns"
      />,
    );
    expect(screen.getByTestId('ns-from-size-F').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('ns-from-mat-gold').props.accessibilityState?.selected).toBe(true);
  });

  it('fires onSubmit with the values when valid', async () => {
    const onSubmit = jest.fn();
    renderIsolated(
      <NibSwapForm
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onSubmit={onSubmit}
        onCancel={() => {}}
        testID="ns"
      />,
    );
    // Change the "to" nib to size B
    fireEvent.press(screen.getByTestId('ns-to-size-B'));
    fireEvent.press(screen.getByTestId('ns-to-mat-gold'));
    fireEvent.press(screen.getByTestId('ns-submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const values = onSubmit.mock.calls[0]![0];
    expect(values.toNib.size).toBe('B');
    expect(values.toNib.material).toBe('gold');
  });

  it('disables submit when from-nib and to-nib are identical', () => {
    renderIsolated(
      <NibSwapForm
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onSubmit={async () => {}}
        onCancel={() => {}}
        testID="ns"
      />,
    );
    // Defaults are from M/steel → to M/steel; submit is disabled.
    expect(screen.getByTestId('ns-submit').props.accessibilityState?.disabled).toBe(true);
  });
});
