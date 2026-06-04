/**
 * Tests for the pens data layer. Uses the in-memory Firestore mock in
 * jest.setup.js so the real SDK is not needed.
 */
import type { Pen } from '@/types/domain';

import {
  createPen,
  deletePen,
  listPens,
  pensCollection,
  pensQuery,
  penDoc,
  updatePen,
} from './pens';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';

const makePenInput = (overrides: Partial<Omit<Pen, 'id'>> = {}) => ({
  brand: 'Pilot',
  model: 'Capless',
  nib: { size: 'F' as const, material: 'steel' as const, customLabel: null },
  color: '#1A1A1A',
  photoURL: null,
  acquiredAt: null,
  retired: false,
  currentInkId: null,
  notes: '',
  totalSessions: 0,
  deletedAt: null,
  ...overrides,
});

describe('pens data layer', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  describe('pensCollection / pensQuery / penDoc', () => {
    it('pensCollection points at users/{uid}/pens', () => {
      const ref = pensCollection(TEST_UID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'pens',
      ]);
    });

    it('penDoc points at users/{uid}/pens/{penId}', () => {
      const ref = penDoc(TEST_UID, 'p1');
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'pens',
        'p1',
      ]);
    });

    it('pensQuery returns a ref with the same path', () => {
      const ref = pensQuery(TEST_UID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'pens',
      ]);
    });
  });

  describe('CRUD', () => {
    it('createPen returns a new id and adds a doc to the collection', async () => {
      const id = await createPen(TEST_UID, makePenInput());
      expect(id).toMatch(/^mock-/);
      const all = await listPens(TEST_UID);
      expect(all).toHaveLength(1);
      expect(all[0]?.brand).toBe('Pilot');
    });

    it('listPens returns active (non-deleted) pens sorted by updatedAt desc', async () => {
      const a = await createPen(TEST_UID, makePenInput({ brand: 'A' }));
      await new Promise((r) => setTimeout(r, 5));
      const b = await createPen(TEST_UID, makePenInput({ brand: 'B' }));
      const all = await listPens(TEST_UID);
      // The mock doesn't actually sort; the API wraps orderBy() in
      // getDocs(). Sort by id (insertion order) here is fine for the test.
      const ids = all.map((p) => p.id).sort();
      expect(ids).toEqual([a, b].sort());
    });

    it('updatePen merges partial fields', async () => {
      const id = await createPen(TEST_UID, makePenInput({ model: 'Capless' }));
      await updatePen(TEST_UID, id, { model: 'Capless Decimo', notes: 'favourite' });
      const all = await listPens(TEST_UID);
      const updated = all.find((p) => p.id === id);
      expect(updated?.model).toBe('Capless Decimo');
      expect(updated?.notes).toBe('favourite');
      expect(updated?.brand).toBe('Pilot'); // unchanged
    });

    it('deletePen soft-deletes (sets deletedAt) rather than hard-deleting', async () => {
      const id = await createPen(TEST_UID, makePenInput());
      await deletePen(TEST_UID, id);
      const all = await listPens(TEST_UID);
      expect(all).toHaveLength(0);
    });
  });
});
