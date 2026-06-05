/**
 * Tests for the users data layer. Mirrors the pens/inks/sessions
 * data-layer tests: small in-memory CRUD checks against the Jest
 * Firestore mock.
 */
import { createUser, getUser, updateUser, userDoc } from './users';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';

const makeUserInput = (overrides: Record<string, unknown> = {}) => ({
  displayName: 'Alice',
  email: 'alice@example.com',
  photoURL: null,
  emailVerified: false,
  plan: 'free' as const,
  settings: {
    theme: 'system' as const,
    fontSize: 'md' as const,
    reminderEnabled: false,
    reminderHour: 20,
    reorderAlertEnabled: true,
  },
  ...overrides,
});

describe('users data layer', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  describe('refs', () => {
    it('userDoc points at users/{uid}', () => {
      const ref = userDoc(TEST_UID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
      ]);
    });
  });

  describe('CRUD', () => {
    it('createUser writes the doc at users/{uid}', async () => {
      await createUser(TEST_UID, makeUserInput());
      const u = await getUser(TEST_UID);
      expect(u?.displayName).toBe('Alice');
      expect(u?.email).toBe('alice@example.com');
    });

    it('getUser returns null when the user does not exist', async () => {
      const u = await getUser('nobody');
      expect(u).toBeNull();
    });

    it('updateUser merges partial fields', async () => {
      await createUser(TEST_UID, makeUserInput());
      await updateUser(TEST_UID, { displayName: 'Alice 2' });
      const u = await getUser(TEST_UID);
      expect(u?.displayName).toBe('Alice 2');
      expect(u?.email).toBe('alice@example.com'); // unchanged
    });

    it('updateUser can update nested settings', async () => {
      await createUser(TEST_UID, makeUserInput());
      await updateUser(TEST_UID, {
        settings: {
          theme: 'system' as const,
          fontSize: 'md' as const,
          reminderEnabled: true,
          reminderHour: 9,
          reorderAlertEnabled: true,
        },
      });
      const u = await getUser(TEST_UID);
      expect(u?.settings.reminderEnabled).toBe(true);
      expect(u?.settings.reminderHour).toBe(9);
    });
  });
});
