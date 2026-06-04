/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertPen } from '@/features/pens/api/pens';

import { PenListScreen } from './PenListScreen';
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

async function seedPen() {
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
}

describe('PenListScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows the empty state when the user has no pens', async () => {
    renderIsolated(
      <PenListScreen uid={TEST_UID} onAddPen={() => {}} onOpenPen={() => {}} testID="pl" />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Add your first pen/i)).toBeTruthy();
    });
  });

  it('renders the "My Pens" section header', async () => {
    renderIsolated(
      <PenListScreen uid={TEST_UID} onAddPen={() => {}} onOpenPen={() => {}} testID="pl" />,
    );
    expect(screen.getByText('My Pens')).toBeTruthy();
  });

  it('fires onAddPen when the header ADD NEW button is pressed (when pens exist)', async () => {
    await seedPen();
    const onAddPen = jest.fn();
    renderIsolated(
      <PenListScreen uid={TEST_UID} onAddPen={onAddPen} onOpenPen={() => {}} testID="pl" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Add new')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Add new'));
    expect(onAddPen).toHaveBeenCalled();
  });
});
