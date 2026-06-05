/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Timestamp, type Timestamp as TimestampType } from 'firebase/firestore';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { createNibSwap } from '@/features/nibs/api/nibs';

import { NibSwapHistory } from './NibSwapHistory';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

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

async function seedSwap(id: string, overrides: { toSize?: 'F' | 'M' | 'B' } = {}) {
  await createNibSwap(TEST_UID, TEST_PEN_ID, {
    penId: TEST_PEN_ID,
    date: Timestamp.now() as unknown as TimestampType,
    fromNib: { size: 'F', material: 'steel', customLabel: null },
    toNib: { size: overrides.toSize ?? 'M', material: 'steel', customLabel: null },
    notes: '',
  } as never);
  return id;
}

describe('NibSwapHistory', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows the empty state when there are no swaps', async () => {
    renderIsolated(
      <NibSwapHistory
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onAddSwap={() => {}}
        onBack={() => {}}
        testID="nh"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/No nib swaps yet/i)).toBeTruthy();
    });
  });

  it('renders the "Nib history" section header', () => {
    renderIsolated(
      <NibSwapHistory
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onAddSwap={() => {}}
        onBack={() => {}}
        testID="nh"
      />,
    );
    expect(screen.getByText('Nib history')).toBeTruthy();
  });

  it('renders a seeded swap after data loads', async () => {
    await seedSwap('a', { toSize: 'B' });
    renderIsolated(
      <NibSwapHistory
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onAddSwap={() => {}}
        onBack={() => {}}
        testID="nh"
      />,
    );
    await waitFor(() => {
      // From F steel → To B steel
      expect(screen.getByText(/F.*→.*B/)).toBeTruthy();
    });
  });

  it('fires onAddSwap when the FAB is pressed', async () => {
    const onAddSwap = jest.fn();
    renderIsolated(
      <NibSwapHistory
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onAddSwap={onAddSwap}
        onBack={() => {}}
        testID="nh"
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Add nib swap')).toBeTruthy();
    });
    fireEvent.press(screen.getByLabelText('Add nib swap'));
    expect(onAddSwap).toHaveBeenCalled();
  });

  it('fires onBack when the back button is pressed', async () => {
    const onBack = jest.fn();
    renderIsolated(
      <NibSwapHistory
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onAddSwap={() => {}}
        onBack={onBack}
        testID="nh"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
