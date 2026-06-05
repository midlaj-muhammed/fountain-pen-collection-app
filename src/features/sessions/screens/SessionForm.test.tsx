/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';

import { SessionForm } from './SessionForm';
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

async function seedPenAndInk() {
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
}

describe('SessionForm', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('renders empty fields for a new session', async () => {
    await seedPenAndInk();
    renderIsolated(
      <SessionForm
        uid={TEST_UID}
        onSubmit={async () => {}}
        onCancel={() => {}}
        testID="sf"
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('sf-duration').props.value).toBe('15');
    });
    expect(screen.getByTestId('sf-rating').props.accessibilityValue?.now).toBe(1);
  });

  it('shows a hint when there are no pens or inks', () => {
    renderIsolated(
      <SessionForm uid={TEST_UID} onSubmit={async () => {}} onCancel={() => {}} testID="sf" />,
    );
    expect(screen.getByText(/Add a pen and an ink first/i)).toBeTruthy();
  });

  it('fires onSubmit with the values when valid', async () => {
    await seedPenAndInk();
    const onSubmit = jest.fn();
    renderIsolated(
      <SessionForm uid={TEST_UID} onSubmit={onSubmit} onCancel={() => {}} testID="sf" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('sf-submit')).toBeTruthy();
    });
    const submit = screen.getByTestId('sf-submit');
    // Sanity: button must be enabled for the press to fire.
    expect(submit.props.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(submit);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const values = onSubmit.mock.calls[0]![0];
    expect(values.durationMin).toBe(15);
    expect(values.penId).toBe('p1');
    expect(values.inkId).toBe('i1');
  });

  it('renders a Back button (no submit) when there are no pens or inks', () => {
    renderIsolated(
      <SessionForm uid={TEST_UID} onSubmit={() => {}} onCancel={() => {}} testID="sf" />,
    );
    expect(screen.queryByTestId('sf-submit')).toBeNull();
    expect(screen.getByTestId('sf-cancel')).toBeTruthy();
  });

  it('updates the rating when a star is pressed', async () => {
    await seedPenAndInk();
    renderIsolated(
      <SessionForm uid={TEST_UID} onSubmit={async () => {}} onCancel={() => {}} testID="sf" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('sf-rating')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('star-4'));
    expect(screen.getByTestId('sf-rating').props.accessibilityValue?.now).toBe(4);
  });
});
