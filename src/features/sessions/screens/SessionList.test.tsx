/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Timestamp, type Timestamp as TimestampType } from 'firebase/firestore';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';
import { createSession } from '@/features/sessions/api/sessions';

import { SessionList } from './SessionList';
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

async function seedSession(overrides: {
  id?: string;
  date?: Date;
  durationMin?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  penBrand?: string;
  penModel?: string;
  inkBrand?: string;
  inkName?: string;
}) {
  const penId = `pen-${overrides.id ?? 'x'}`;
  const inkId = `ink-${overrides.id ?? 'x'}`;
  await upsertPen(TEST_UID, penId, {
    brand: overrides.penBrand ?? 'Pilot',
    model: overrides.penModel ?? 'Capless',
    nib: { size: 'F', material: 'steel', customLabel: null },
    color: '#1A1A1A',
    photoURL: null,
    acquiredAt: null,
    retired: false,
    currentInkId: null,
    notes: '',
    totalSessions: 0,
  });
  await upsertInk(TEST_UID, inkId, {
    brand: overrides.inkBrand ?? 'Pelikan',
    name: overrides.inkName ?? '4001',
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

  // The mock stores whatever we pass as `date` verbatim. We want to be
  // able to seed a session "30 days ago" etc. for bucket tests.
  const dateValue = overrides.date
    ? {
        seconds: overrides.date.getTime() / 1000,
        nanoseconds: 0,
        toDate: () => overrides.date as Date,
      }
    : Timestamp.now();

  await createSession(TEST_UID, {
    date: dateValue as unknown as TimestampType,
    durationMin: overrides.durationMin ?? 15,
    penId,
    inkId,
    inkDriedOut: false,
    rating: overrides.rating ?? 3,
    notes: '',
  });
}

describe('SessionList', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows the empty state when there are no sessions', async () => {
    renderIsolated(
      <SessionList
        uid={TEST_UID}
        onAddSession={() => {}}
        onOpenSession={() => {}}
        testID="sl"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Log your first session/i)).toBeTruthy();
    });
  });

  it('renders the Sessions section header', async () => {
    renderIsolated(
      <SessionList uid={TEST_UID} onAddSession={() => {}} onOpenSession={() => {}} testID="sl" />,
    );
    expect(screen.getByText('Sessions')).toBeTruthy();
  });

  it('groups a single session under "Today"', async () => {
    await seedSession({ id: 'a' });
    renderIsolated(
      <SessionList uid={TEST_UID} onAddSession={() => {}} onOpenSession={() => {}} testID="sl" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeTruthy();
    });
    expect(screen.getByText('Pilot Capless')).toBeTruthy();
    expect(screen.getByText(/Pelikan 4001/)).toBeTruthy();
  });

  it('groups an old session under "Older"', async () => {
    await seedSession({ id: 'a', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
    renderIsolated(
      <SessionList uid={TEST_UID} onAddSession={() => {}} onOpenSession={() => {}} testID="sl" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Older')).toBeTruthy();
    });
  });

  it('fires onAddSession when the FAB is pressed', async () => {
    const onAddSession = jest.fn();
    renderIsolated(
      <SessionList
        uid={TEST_UID}
        onAddSession={onAddSession}
        onOpenSession={() => {}}
        testID="sl"
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Add session')).toBeTruthy();
    });
    fireEvent.press(screen.getByLabelText('Add session'));
    expect(onAddSession).toHaveBeenCalled();
  });
});
