/* eslint-disable react-native/no-raw-text */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { upsertPen } from '@/features/pens/api/pens';
import { renderWithProviders } from '@/lib/test/renderWithProviders';

import { PenDetailScreen } from './PenDetailScreen';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';
const TEST_PEN_ID = 'pen-1';

async function seedPen() {
  firestoreMock.__resetMock();
  await upsertPen(TEST_UID, TEST_PEN_ID, {
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

describe('PenDetailScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('renders the loading skeleton when no pen exists', () => {
    renderWithProviders(
      <PenDetailScreen
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="pd"
      />,
    );
    expect(screen.getByTestId('pd')).toBeTruthy();
  });

  it('renders the pen model after the data loads', async () => {
    await seedPen();
    renderWithProviders(
      <PenDetailScreen
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={() => {}}
        testID="pd"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Capless')).toBeTruthy();
    });
  });

  it('fires onBack when the back button is pressed', async () => {
    await seedPen();
    const onBack = jest.fn();
    renderWithProviders(
      <PenDetailScreen
        uid={TEST_UID}
        penId={TEST_PEN_ID}
        onEdit={() => {}}
        onDelete={async () => {}}
        onBack={onBack}
        testID="pd"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
