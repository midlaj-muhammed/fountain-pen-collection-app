/**
 * Tests for AuthProvider. The Firebase SDKs are mocked in jest.setup.js;
 * these tests verify the React-side contract: the provider exposes
 * the current user, the signOut method, and — most importantly —
 * seeds the Firestore user doc on first authentication. Without
 * that seed, downstream screens (Settings, Profile, etc.) would
 * hang on a skeleton forever because their `useUser(uid)` query
 * would return null for a user doc that was never created.
 */
/* eslint-disable import/first */
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock the user-doc surface for this test file only. The barrel
// `@/lib/firebase` re-exports these symbols, and AuthProvider
// imports them from the barrel — we need the barrel to hand back
// our jest.fn()s, not the real implementations (which spin up
// the real Firestore SDK against a non-existent emulator).
jest.mock('@/features/profile/api/users', () => ({
  __esModule: true,
  createUser: jest.fn(async () => undefined),
  getUser: jest.fn(async () => null),
  userDoc: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const { createUser: mockCreateUser, getUser: mockGetUser } = require('@/features/profile/api/users') as {
  createUser: jest.Mock;
  getUser: jest.Mock;
};

// Imported after the mock is registered so AuthProvider picks up
// the mocked user-doc functions.
import { AuthProvider, useAuth } from './AuthProvider';

function Probe() {
  const { user, status } = useAuth();
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="uid">{user?.uid ?? 'none'}</Text>
    </>
  );
}

describe('AuthProvider — user doc seeding', () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
    mockGetUser.mockReset();
  });

  it('creates the user doc on first auth when none exists', async () => {
    mockGetUser.mockResolvedValueOnce(null);
    mockCreateUser.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    // The seed input must carry the user's display name, email,
    // default settings, etc.
    const [uidArg, inputArg] = mockCreateUser.mock.calls[0];
    expect(uidArg).toBe('mock-uid');
    expect(inputArg).toEqual(
      expect.objectContaining({
        email: 'mock@example.com',
        settings: expect.objectContaining({
          theme: 'system',
          fontSize: 'md',
          reminderEnabled: false,
          reminderHour: 20,
          reorderAlertEnabled: true,
        }),
      }),
    );
  });

  it('skips createUser when the doc already exists', async () => {
    mockGetUser.mockResolvedValueOnce({ uid: 'mock-uid', settings: {} });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('does not throw if the seed fails (logs a warning instead)', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('network down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(warn).toHaveBeenCalledWith(
      '[auth] ensureUserDoc failed:',
      expect.any(Error),
    );
    warn.mockRestore();
  });
});
