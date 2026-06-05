/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { createUser } from '@/features/profile/api/users';

import { SettingsScreen } from './SettingsScreen';
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

async function seedUser(overrides: Partial<{ reminderEnabled: boolean; reminderHour: number }> = {}) {
  await createUser(TEST_UID, {
    displayName: 'Alice',
    email: 'alice@example.com',
    photoURL: null,
    emailVerified: true,
    plan: 'free',
    settings: {
      theme: 'system',
      fontSize: 'md',
      reminderEnabled: overrides.reminderEnabled ?? false,
      reminderHour: overrides.reminderHour ?? 20,
      reorderAlertEnabled: true,
    },
  });
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders the "Settings" section header', () => {
    renderIsolated(
      <SettingsScreen uid={TEST_UID} onBack={() => {}} onOpenProfile={() => {}} testID="se" />,
    );
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('shows the loading skeleton when no user exists', () => {
    renderIsolated(
      <SettingsScreen uid={TEST_UID} onBack={() => {}} onOpenProfile={() => {}} testID="se" />,
    );
    expect(screen.getByTestId('se')).toBeTruthy();
  });

  it('shows the theme row after data loads', async () => {
    await seedUser();
    renderIsolated(
      <SettingsScreen uid={TEST_UID} onBack={() => {}} onOpenProfile={() => {}} testID="se" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeTruthy();
    });
  });

  it('shows the daily reminder toggle', async () => {
    await seedUser();
    renderIsolated(
      <SettingsScreen uid={TEST_UID} onBack={() => {}} onOpenProfile={() => {}} testID="se" />,
    );
    await waitFor(() => {
      expect(screen.getByText('Daily reminder')).toBeTruthy();
    });
  });

  it('fires onOpenProfile when the profile row is pressed', async () => {
    await seedUser();
    const onOpenProfile = jest.fn();
    renderIsolated(
      <SettingsScreen
        uid={TEST_UID}
        onBack={() => {}}
        onOpenProfile={onOpenProfile}
        testID="se"
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('se-profile')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('se-profile'));
    expect(onOpenProfile).toHaveBeenCalled();
  });

  it('fires onSignOut when the Sign out button is pressed', async () => {
    await seedUser();
    const onSignOut = jest.fn();
    renderIsolated(
      <SettingsScreen
        uid={TEST_UID}
        onBack={() => {}}
        onOpenProfile={() => {}}
        onSignOut={onSignOut}
        testID="se"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Sign out'));
    expect(onSignOut).toHaveBeenCalled();
  });
});
