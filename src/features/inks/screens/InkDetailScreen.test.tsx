/* eslint-disable react-native/no-raw-text */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { upsertInk } from '@/features/inks/api/inks';
import { renderWithProviders } from '@/lib/test/renderWithProviders';

import { InkDetailScreen } from './InkDetailScreen';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';
const TEST_INK_ID = 'ink-1';

async function seedInk() {
  firestoreMock.__resetMock();
  await upsertInk(TEST_UID, TEST_INK_ID, {
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

describe('InkDetailScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('renders the loading skeleton when no ink exists', () => {
    renderWithProviders(
      <InkDetailScreen
        uid={TEST_UID}
        inkId={TEST_INK_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="id"
      />,
    );
    expect(screen.getByTestId('id')).toBeTruthy();
  });

  it('renders the ink name after the data loads', async () => {
    await seedInk();
    renderWithProviders(
      <InkDetailScreen
        uid={TEST_UID}
        inkId={TEST_INK_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="id"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('4001')).toBeTruthy();
    });
  });

  it('fires onBack when the back button is pressed', async () => {
    await seedInk();
    const onBack = jest.fn();
    renderWithProviders(
      <InkDetailScreen
        uid={TEST_UID}
        inkId={TEST_INK_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={onBack}
        testID="id"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('soft-deletes the ink and fires onDelete after confirm', async () => {
    await seedInk();
    const onDelete = jest.fn();
    renderWithProviders(
      <InkDetailScreen
        uid={TEST_UID}
        inkId={TEST_INK_ID}
        onEdit={() => {}}
        onDelete={onDelete}
        onBack={() => {}}
        testID="id"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Delete ink')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Delete ink'));
    // Confirm modal opens
    await waitFor(() => {
      expect(screen.getByText('Delete this ink?')).toBeTruthy();
    });
    // Press the inner Delete button (text "Delete" inside the modal)
    fireEvent.press(screen.getByText('Delete'));
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
