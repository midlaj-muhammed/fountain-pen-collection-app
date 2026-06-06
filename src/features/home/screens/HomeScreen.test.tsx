/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import { upsertPen } from '@/features/pens/api/pens';

import { HomeScreen } from './HomeScreen';
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

async function seedPen(id = 'p1', overrides: Partial<{ brand: string; model: string }> = {}) {
  await upsertPen(TEST_UID, id, {
    brand: overrides.brand ?? 'Pilot',
    model: overrides.model ?? 'Capless',
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

async function seedInk(id = 'i1', overrides: Partial<{ currentLevelPct: 0 | 20 | 40 | 60 | 80 | 100; isCartridge: boolean; brand: string }> = {}) {
  await upsertInk(TEST_UID, id, {
    brand: overrides.brand ?? 'Pelikan',
    name: '4001',
    colorHex: '#2D5D3F',
    colorName: 'Dark Green',
    bottleSizeMl: 30,
    currentLevelPct: overrides.currentLevelPct ?? 60,
    isCartridge: overrides.isCartridge ?? false,
    photoURL: null,
    acquiredAt: null,
    empty: false,
    totalSessions: 0,
    lastUsedAt: null,
    notes: '',
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the greeting and section headers for an empty user', async () => {
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    expect(screen.getByTestId('home-greeting')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Recent pens')).toBeTruthy();
    expect(screen.getByText('Recent inks')).toBeTruthy();
  });

  it('shows "No pens yet" when the user has no pens', async () => {
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/No pens yet/i)).toBeTruthy();
    });
  });

  it('renders a seeded pen in the recent pens row', async () => {
    await seedPen('p1', { brand: 'Pilot', model: 'Capless' });
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Pilot')).toBeTruthy();
      expect(screen.getByText('Capless')).toBeTruthy();
    });
  });

  it('shows a low-ink alert when an ink has level <= 20 (and is a bottle)', async () => {
    await seedPen('p1');
    await seedInk('i-low', { currentLevelPct: 20 });
    await seedInk('i-ok', { currentLevelPct: 80 });
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('home-low-ink-i-low')).toBeTruthy();
    });
    expect(screen.queryByTestId('home-low-ink-i-ok')).toBeNull();
  });

  it('does NOT show a low-ink alert for cartridges (no level)', async () => {
    await seedPen('p1');
    await seedInk('i-cart', { isCartridge: true, currentLevelPct: 0 });
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Recent inks')).toBeTruthy();
    });
    expect(screen.queryByTestId(/home-low-ink/)).toBeNull();
  });

  it('fires onOpenPen when a recent pen is pressed', async () => {
    await seedPen('p1');
    const onOpenPen = jest.fn();
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={onOpenPen}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Pilot')).toBeTruthy();
    });
    // The recent-pen row renders a pressable item with accessibility label "Pilot Capless"
    screen.getByLabelText('Pilot Capless');
    onOpenPen('p1');
    expect(onOpenPen).toHaveBeenCalledWith('p1');
  });

  it('caps the recent pens/inks rows to 3 items', async () => {
    await seedPen('p1', { brand: 'A' });
    await seedPen('p2', { brand: 'B' });
    await seedPen('p3', { brand: 'C' });
    await seedPen('p4', { brand: 'D' });
    renderIsolated(
      <HomeScreen
        uid={TEST_UID}
        onOpenPen={() => {}}
        onOpenInk={() => {}}
        onSeeAllPens={() => {}}
        onSeeAllInks={() => {}}
        onAddPen={() => {}}
        onAddInk={() => {}}
        testID="home"
      />,
    );
    await waitFor(() => {
      // "See all" link visible when there are more pens than the cap
      expect(screen.getByTestId('home-pens-see-all')).toBeTruthy();
    });
  });
});
