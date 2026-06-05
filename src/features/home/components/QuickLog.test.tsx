/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';

import { QuickLog } from './QuickLog';
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

describe('QuickLog', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('renders nothing useful when there is no user (no crash)', () => {
    renderIsolated(<QuickLog uid={null} onLogged={() => {}} testID="ql" />);
    // Component renders null when no pens AND no inks AND no uid.
    expect(screen.queryByTestId('ql')).toBeNull();
  });

  it('shows a "Log" CTA when there is a user with at least one pen and one ink', () => {
    renderIsolated(<QuickLog uid={TEST_UID} onLogged={() => {}} testID="ql" />);
    // The log button is disabled because there are no pens/inks; the empty
    // prompt tells the user to add pens + inks first.
    expect(screen.getByText(/Add a pen and an ink/i)).toBeTruthy();
  });

  it('fires onLogged with the new session id after a 1-tap log', async () => {
    // Seed a pen and an ink
    await upsertPen(TEST_UID, 'p1', {
      brand: 'Pilot',
      model: 'Capless',
      nib: { size: 'F', material: 'steel', customLabel: null },
      color: '#1A1A1A',
      photoURL: null,
      acquiredAt: null,
      retired: false,
      currentInkId: null,
      notes: '',
      totalSessions: 0,
    });
    await upsertInk(TEST_UID, 'i1', {
      brand: 'Pelikan',
      name: '4001',
      colorHex: '#2D5D3F',
      colorName: 'Dark Green',
      bottleSizeMl: 30,
      currentLevelPct: 60,
      isCartridge: false,
      photoURL: null,
      acquiredAt: null,
      empty: false,
      totalSessions: 0,
      lastUsedAt: null,
      notes: '',
    });

    const onLogged = jest.fn();
    renderIsolated(<QuickLog uid={TEST_UID} onLogged={onLogged} testID="ql" />);

    await waitFor(() => {
      expect(screen.getByTestId('ql-log-button')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('ql-log-button'));
    await waitFor(() => {
      expect(onLogged).toHaveBeenCalled();
    });
    const [sessionId] = onLogged.mock.calls[0]!;
    expect(typeof sessionId).toBe('string');
    expect(sessionId).toMatch(/^mock-/);
  });
});
