/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';
import { createSession, listSessions } from '@/features/sessions/api/sessions';

import { SessionDetailScreen } from './SessionDetailScreen';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';
const TEST_SESSION_ID = 's1';

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

async function seedSessionWithPenAndInk(): Promise<string> {
  firestoreMock.__resetMock();
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
    date: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date() } as never,
    durationMin: 30,
    penId: 'p1',
    inkId: 'i1',
    inkDriedOut: true,
    rating: 4,
    notes: 'morning pages',
  });
  const all = await listSessions(TEST_UID);
  return all[0]!.id;
}

describe('SessionDetailScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the loading skeleton when no session exists', () => {
    renderIsolated(
      <SessionDetailScreen
        uid={TEST_UID}
        sessionId={TEST_SESSION_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="sd"
      />,
    );
    expect(screen.getByTestId('sd')).toBeTruthy();
  });

  it('renders the session details after the data loads', async () => {
    const realId = await seedSessionWithPenAndInk();
    renderIsolated(
      <SessionDetailScreen
        uid={TEST_UID}
        sessionId={realId}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="sd"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Pilot Capless')).toBeTruthy();
      expect(screen.getByText(/Pelikan 4001/)).toBeTruthy();
      expect(screen.getByText('30 min')).toBeTruthy();
    });
  });

  it('fires onBack when the back button is pressed', async () => {
    const realId = await seedSessionWithPenAndInk();
    const onBack = jest.fn();
    renderIsolated(
      <SessionDetailScreen
        uid={TEST_UID}
        sessionId={realId}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={onBack}
        testID="sd"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('soft-deletes the session and fires onDelete after confirm', async () => {
    const realId = await seedSessionWithPenAndInk();
    const onDelete = jest.fn();
    renderIsolated(
      <SessionDetailScreen
        uid={TEST_UID}
        sessionId={realId}
        onEdit={() => {}}
        onDelete={onDelete}
        onBack={() => {}}
        testID="sd"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Delete session')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Delete session'));
    await waitFor(() => {
      expect(screen.getByText('Delete this session?')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Delete'));
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
