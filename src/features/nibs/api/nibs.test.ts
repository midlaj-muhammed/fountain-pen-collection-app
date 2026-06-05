/**
 * Tests for the nib-swap data layer. Mirrors the pens/inks/sessions
 * data-layer tests: small in-memory CRUD checks against the Jest
 * Firestore mock.
 */
import { Timestamp } from 'firebase/firestore';

import {
  createNibSwap,
  deleteNibSwap,
  listNibSwaps,
  nibSwapCollection,
  nibSwapDoc,
  updateNibSwap,
} from './nibs';
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

const TEST_UID = 'alice-uid';
const TEST_PEN_ID = 'pen-1';

const makeSwapInput = (overrides: Record<string, unknown> = {}) => ({
  penId: TEST_PEN_ID,
  date: Timestamp.now(),
  fromNib: { size: 'F' as const, material: 'steel' as const, customLabel: null },
  toNib: { size: 'M' as const, material: 'steel' as const, customLabel: null },
  notes: '',
  ...overrides,
});

describe('nib data layer', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  describe('refs', () => {
    it('nibSwapCollection points at users/{uid}/pens/{penId}/nibSwaps', () => {
      const ref = nibSwapCollection(TEST_UID, TEST_PEN_ID);
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'pens',
        TEST_PEN_ID,
        'nibSwaps',
      ]);
    });

    it('nibSwapDoc points at users/{uid}/pens/{penId}/nibSwaps/{swapId}', () => {
      const ref = nibSwapDoc(TEST_UID, TEST_PEN_ID, 'n1');
      expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
        'users',
        TEST_UID,
        'pens',
        TEST_PEN_ID,
        'nibSwaps',
        'n1',
      ]);
    });
  });

  describe('CRUD', () => {
    it('createNibSwap returns a new id and adds a doc', async () => {
      const id = await createNibSwap(TEST_UID, TEST_PEN_ID, makeSwapInput());
      expect(id).toMatch(/^mock-/);
      const all = await listNibSwaps(TEST_UID, TEST_PEN_ID);
      expect(all).toHaveLength(1);
      expect(all[0]?.toNib.size).toBe('M');
    });

    it('listNibSwaps is scoped to the given pen', async () => {
      await createNibSwap(TEST_UID, 'pen-A', makeSwapInput());
      await createNibSwap(TEST_UID, 'pen-B', makeSwapInput());
      const a = await listNibSwaps(TEST_UID, 'pen-A');
      const b = await listNibSwaps(TEST_UID, 'pen-B');
      expect(a).toHaveLength(1);
      expect(b).toHaveLength(1);
    });

    it('updateNibSwap merges partial fields', async () => {
      const id = await createNibSwap(TEST_UID, TEST_PEN_ID, makeSwapInput());
      await updateNibSwap(TEST_UID, TEST_PEN_ID, id, { notes: 'felt smoother' });
      const all = await listNibSwaps(TEST_UID, TEST_PEN_ID);
      expect(all[0]?.notes).toBe('felt smoother');
      expect(all[0]?.toNib.size).toBe('M');
    });

    it('deleteNibSwap hard-deletes (no soft-delete for nib swaps)', async () => {
      const id = await createNibSwap(TEST_UID, TEST_PEN_ID, makeSwapInput());
      await deleteNibSwap(TEST_UID, TEST_PEN_ID, id);
      const all = await listNibSwaps(TEST_UID, TEST_PEN_ID);
      expect(all).toHaveLength(0);
    });
  });
});
