/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';

import { DeleteAccountScreen } from './DeleteAccountScreen';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';

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

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the "Delete account" header', () => {
    renderIsolated(
      <DeleteAccountScreen uid={TEST_UID} onBack={() => {}} onDeleted={() => {}} testID="da" />,
    );
    expect(screen.getAllByText('Delete account').length).toBeGreaterThan(0);
  });

  it('disables the Delete button until the user types DELETE', () => {
    renderIsolated(
      <DeleteAccountScreen uid={TEST_UID} onBack={() => {}} onDeleted={() => {}} testID="da" />,
    );
    expect(screen.getByTestId('da-delete').props.accessibilityState?.disabled).toBe(true);
  });

  it('enables the Delete button when DELETE is typed', async () => {
    renderIsolated(
      <DeleteAccountScreen uid={TEST_UID} onBack={() => {}} onDeleted={() => {}} testID="da" />,
    );
    fireEvent.changeText(screen.getByTestId('da-confirm'), 'DELETE');
    expect(screen.getByTestId('da-delete').props.accessibilityState?.disabled).toBeFalsy();
  });

  it('fires onDeleted when Delete is pressed (after typing DELETE)', async () => {
    const onDeleted = jest.fn();
    renderIsolated(
      <DeleteAccountScreen
        uid={TEST_UID}
        onBack={() => {}}
        onDeleted={onDeleted}
        testID="da"
      />,
    );
    fireEvent.changeText(screen.getByTestId('da-confirm'), 'DELETE');
    fireEvent.press(screen.getByTestId('da-delete'));
    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalled();
    });
  });
});
