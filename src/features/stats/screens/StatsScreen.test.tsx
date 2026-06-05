/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react-native';
import { type Timestamp as TimestampType } from 'firebase/firestore';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';
import { createSession } from '@/features/sessions/api/sessions';

import { StatsScreen } from './StatsScreen';
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

const mkTimestamp = (d: Date): TimestampType =>
  ({ seconds: d.getTime() / 1000, nanoseconds: 0, toDate: () => d } as unknown as TimestampType);

async function seedMinimal() {
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
  await createSession(TEST_UID, {
    date: mkTimestamp(new Date('2026-06-05T12:00:00Z')),
    durationMin: 30,
    penId: 'p1',
    inkId: 'i1',
    inkDriedOut: false,
    rating: 4,
    notes: '',
  });
}

describe('StatsScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the "Stats" section header', () => {
    renderIsolated(<StatsScreen uid={TEST_UID} testID="st" />);
    expect(screen.getByText('Stats')).toBeTruthy();
  });

  it('shows the empty hint when there are no sessions', async () => {
    renderIsolated(<StatsScreen uid={TEST_UID} testID="st" />);
    await waitFor(() => {
      expect(screen.getByText(/No sessions yet/i)).toBeTruthy();
    });
  });

  it('shows the totals after data loads', async () => {
    await seedMinimal();
    renderIsolated(<StatsScreen uid={TEST_UID} testID="st" />);
    expect(await screen.findByTestId('st-sessions')).toBeTruthy();
    // The exact "1" appears at least once (the session count).
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('shows the average rating after data loads', async () => {
    await seedMinimal();
    renderIsolated(<StatsScreen uid={TEST_UID} testID="st" />);
    await waitFor(() => {
      expect(screen.getByText('Avg rating')).toBeTruthy();
    });
    expect(screen.getByText('4')).toBeTruthy();
  });
});
