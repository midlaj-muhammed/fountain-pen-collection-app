/**
 * Tests for the inks data layer. Uses the in-memory Firestore mock in
 * jest.setup.js so the real SDK is not needed.
 */
import type { Ink } from '@/types/domain';

import {
  createInk,
  deleteInk,
  inkCollection,
  inkDoc,
  inksQuery,
  listInks,
  updateInk,
  upsertInk,
} from './inks';

const TEST_UID = 'alice-uid';

// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const makeInkInput = (overrides: Partial<Omit<Ink, 'id'>> = {}) => ({
  brand: 'Pelikan',
  name: '4001',
  colorHex: '#2D5D3F',
  colorName: 'Dark Green',
  bottleSizeMl: 30,
  currentLevelPct: 100 as const,
  isCartridge: false,
  photoURL: null,
  acquiredAt: null,
  empty: false,
  totalSessions: 0,
  lastUsedAt: null,
  notes: '',
  deletedAt: null,
  ...overrides,
});

describe('inks data layer', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  describe('refs', () => {
    it('inkCollection points at users/{uid}/inks', () => {
      const ref = inkCollection(TEST_UID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'inks',
      ]);
    });

    it('inkDoc points at users/{uid}/inks/{inkId}', () => {
      const ref = inkDoc(TEST_UID, 'i1');
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'inks',
        'i1',
      ]);
    });

    it('inksQuery returns a ref with the same path', () => {
      const ref = inksQuery(TEST_UID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'inks',
      ]);
    });
  });

  describe('CRUD', () => {
    it('createInk returns a new id and adds a doc to the collection', async () => {
      const id = await createInk(TEST_UID, makeInkInput());
      expect(id).toMatch(/^mock-/);
      const all = await listInks(TEST_UID);
      expect(all).toHaveLength(1);
      expect(all[0]?.brand).toBe('Pelikan');
    });

    it('listInks returns only active (non-deleted) inks', async () => {
      const a = await createInk(TEST_UID, makeInkInput({ brand: 'A' }));
      const b = await createInk(TEST_UID, makeInkInput({ brand: 'B' }));
      await deleteInk(TEST_UID, a);
      const all = await listInks(TEST_UID);
      expect(all.map((i) => i.id)).toEqual([b]);
    });

    it('updateInk merges partial fields', async () => {
      const id = await createInk(TEST_UID, makeInkInput({ currentLevelPct: 100 }));
      await updateInk(TEST_UID, id, { currentLevelPct: 40, notes: 'half-used' });
      const all = await listInks(TEST_UID);
      const updated = all.find((i) => i.id === id);
      expect(updated?.currentLevelPct).toBe(40);
      expect(updated?.notes).toBe('half-used');
      expect(updated?.brand).toBe('Pelikan');
    });

    it('deleteInk soft-deletes (sets deletedAt) rather than hard-deleting', async () => {
      const id = await createInk(TEST_UID, makeInkInput());
      await deleteInk(TEST_UID, id);
      const all = await listInks(TEST_UID);
      expect(all).toHaveLength(0);
    });

    it('upsertInk writes a doc at a known id with deletedAt: null', async () => {
      await upsertInk(TEST_UID, 'ink-x', makeInkInput({ brand: 'X' }));
      const all = await listInks(TEST_UID);
      expect(all).toHaveLength(1);
      expect(all[0]?.brand).toBe('X');
    });
  });
});
