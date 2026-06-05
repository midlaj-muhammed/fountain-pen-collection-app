/**
 * Tests for the sessions data layer — minimal coverage in S3.2; S4
 * extends with the Cloud Function trigger, date-grouped list, etc.
 */
import { Timestamp } from 'firebase/firestore';

import {
  createSession,
  deleteSession,
  listSessions,
  sessionCollection,
  sessionDoc,
  updateSession,
} from './sessions';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';

const makeSessionInput = (overrides: Record<string, unknown> = {}) => ({
  date: Timestamp.now(),
  durationMin: 15,
  penId: 'p1',
  inkId: 'i1',
  inkDriedOut: false,
  rating: 1 as const,
  notes: '',
  ...overrides,
});

describe('sessions data layer', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('sessionCollection points at users/{uid}/sessions', () => {
    const ref = sessionCollection(TEST_UID);
    expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
      'users',
      TEST_UID,
      'sessions',
    ]);
  });

  it('sessionDoc points at users/{uid}/sessions/{id}', () => {
    const ref = sessionDoc(TEST_UID, 's1');
    expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
      'users',
      TEST_UID,
      'sessions',
      's1',
    ]);
  });

  it('createSession returns a new id and persists a doc', async () => {
    const id = await createSession(TEST_UID, makeSessionInput());
    expect(id).toMatch(/^mock-/);
    const all = await listSessions(TEST_UID);
    expect(all).toHaveLength(1);
    expect(all[0]?.penId).toBe('p1');
    expect(all[0]?.inkId).toBe('i1');
  });

  it('updateSession merges partial fields', async () => {
    const id = await createSession(TEST_UID, makeSessionInput());
    await updateSession(TEST_UID, id, { durationMin: 30, notes: 'morning pages' });
    const all = await listSessions(TEST_UID);
    const s = all.find((x) => x.id === id);
    expect(s?.durationMin).toBe(30);
    expect(s?.notes).toBe('morning pages');
  });

  it('deleteSession soft-deletes (sets deletedAt)', async () => {
    const id = await createSession(TEST_UID, makeSessionInput());
    await deleteSession(TEST_UID, id);
    const all = await listSessions(TEST_UID);
    expect(all).toHaveLength(0);
  });
});
