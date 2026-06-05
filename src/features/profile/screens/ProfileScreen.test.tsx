/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { createUser } from '@/features/profile/api/users';

import { ProfileScreen } from './ProfileScreen';
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

async function seedUser(overrides: { displayName?: string } = {}) {
  await createUser(TEST_UID, {
    displayName: overrides.displayName ?? 'Alice',
    email: 'alice@example.com',
    photoURL: null,
    emailVerified: true,
    plan: 'free',
    settings: {
      theme: 'system',
      fontSize: 'md',
      reminderEnabled: false,
      reminderHour: 20,
      reorderAlertEnabled: true,
    },
  });
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the "Profile" section header', () => {
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={() => {}} testID="pr" />);
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('shows the loading skeleton when no user exists', () => {
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={() => {}} testID="pr" />);
    expect(screen.getByTestId('pr')).toBeTruthy();
  });

  it('shows the seeded display name + email after the data loads', async () => {
    await seedUser();
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={() => {}} testID="pr" />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
      expect(screen.getByText('alice@example.com')).toBeTruthy();
    });
  });

  it('shows the plan badge', async () => {
    await seedUser();
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={() => {}} testID="pr" />);
    await waitFor(() => {
      expect(screen.getByText('Free plan')).toBeTruthy();
    });
  });

  it('enables an Edit toggle that swaps to a name field', async () => {
    await seedUser();
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={() => {}} testID="pr" />);
    await waitFor(() => {
      expect(screen.getByTestId('pr-edit')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('pr-edit'));
    expect(screen.getByTestId('pr-name-input')).toBeTruthy();
  });

  it('fires the back callback when the back button is pressed', async () => {
    const onBack = jest.fn();
    await seedUser();
    renderIsolated(<ProfileScreen uid={TEST_UID} onBack={onBack} testID="pr" />);
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
