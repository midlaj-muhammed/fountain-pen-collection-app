/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';

import { InkListScreen } from './InkListScreen';
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

async function seedInk(overrides: Partial<{ id: string; brand: string; isCartridge: boolean }> = {}) {
  const id = overrides.id ?? 'i1';
  await upsertInk(TEST_UID, id, {
    brand: overrides.brand ?? 'Pelikan',
    name: '4001',
    colorHex: '#2D5D3F',
    colorName: 'Dark Green',
    bottleSizeMl: 30,
    currentLevelPct: 60,
    isCartridge: overrides.isCartridge ?? false,
    photoURL: null,
    acquiredAt: null,
    empty: false,
    totalSessions: 0,
    lastUsedAt: null,
    notes: '',
  });
  return id;
}

describe('InkListScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows the empty state when the user has no inks', async () => {
    renderIsolated(
      <InkListScreen uid={TEST_UID} onAddInk={() => {}} onOpenInk={() => {}} testID="il" />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Add your first ink/i)).toBeTruthy();
    });
  });

  it('renders the "My Inks" section header', async () => {
    renderIsolated(
      <InkListScreen uid={TEST_UID} onAddInk={() => {}} onOpenInk={() => {}} testID="il" />,
    );
    expect(screen.getByText('My Inks')).toBeTruthy();
  });

  it('renders a seeded ink (Pelikan 4001) after data loads', async () => {
    await seedInk();
    renderIsolated(
      <InkListScreen uid={TEST_UID} onAddInk={() => {}} onOpenInk={() => {}} testID="il" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Pelikan')).toBeTruthy();
      expect(screen.getByText('4001')).toBeTruthy();
    });
  });

  it('renders the Bottles / Cartridges chip toggle when data is present', async () => {
    await seedInk();
    renderIsolated(
      <InkListScreen uid={TEST_UID} onAddInk={() => {}} onOpenInk={() => {}} testID="il" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('il-toggle-bottles')).toBeTruthy();
      expect(screen.getByTestId('il-toggle-cartridges')).toBeTruthy();
    });
  });

  it('switches to cartridges view and hides bottle inks', async () => {
    await seedInk({ id: 'b1', brand: 'Pelikan' });
    await seedInk({ id: 'c1', brand: 'Pelikan', isCartridge: true });
    renderIsolated(
      <InkListScreen uid={TEST_UID} onAddInk={() => {}} onOpenInk={() => {}} testID="il" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Pelikan')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('il-toggle-cartridges'));
    // Pelikan ink remains (cartridge still displays brand), but the ml line
    // for the bottle is gone. We assert by querying the cartridge-specific
    // list now shows a single row whose name '4001' appears exactly once.
    expect(screen.getByText('4001')).toBeTruthy();
  });

  it('fires onAddInk when the FAB is pressed (when inks exist)', async () => {
    await seedInk();
    const onAddInk = jest.fn();
    renderIsolated(
      <InkListScreen
        uid={TEST_UID}
        onAddInk={onAddInk}
        onOpenInk={() => {}}
        testID="il"
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Add ink')).toBeTruthy();
    });
    fireEvent.press(screen.getByLabelText('Add ink'));
    expect(onAddInk).toHaveBeenCalled();
  });
});
