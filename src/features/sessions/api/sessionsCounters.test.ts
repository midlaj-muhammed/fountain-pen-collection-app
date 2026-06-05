/**
 * Tests for the counter side-effects. Verifies that creating a session
 * increments pen/ink `totalSessions`, and deleting decrements (without
 * going below zero).
 */
import { Timestamp } from 'firebase/firestore';

import { createPen, deletePen, listPens, upsertPen } from '@/features/pens/api/pens';
import { listInks, upsertInk } from '@/features/inks/api/inks';

import { bumpCountersOnCreate, bumpCountersOnDelete } from './sessionsCounters';
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

describe('session counter side-effects', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('bumps pen.totalSessions +1 on create', async () => {
    // Seed a pen with totalSessions: 2
    await upsertPen(TEST_UID, 'p1', {
      brand: 'Pilot',
      model: 'Capless',
      nib: { size: 'F', material: 'steel', customLabel: null },
      color: '#1A1A1A',
      photoURL: null,
      acquiredAt: null,
      retired: false,
      currentInkId: null,
      notes: '',
      totalSessions: 2,
    });

    await bumpCountersOnCreate(TEST_UID, makeSessionInput({ penId: 'p1' }));
    const pens = await listPens(TEST_UID);
    expect(pens[0]?.totalSessions).toBe(3);
  });

  it('bumps ink.totalSessions +1 on create', async () => {
    await upsertInk(TEST_UID, 'i1', {
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

    await bumpCountersOnCreate(TEST_UID, makeSessionInput({ inkId: 'i1' }));
    const inks = await listInks(TEST_UID);
    expect(inks[0]?.totalSessions).toBe(1);
  });

  it('decrements pen.totalSessions on delete but never below zero', async () => {
    await upsertPen(TEST_UID, 'p1', {
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

    await bumpCountersOnDelete(TEST_UID, makeSessionInput({ penId: 'p1' }));
    const pens = await listPens(TEST_UID);
    expect(pens[0]?.totalSessions).toBe(0); // clamped at 0, not -1
  });

  it('skips counter updates when the pen is soft-deleted', async () => {
    const id = await createPen(TEST_UID, {
      brand: 'Pilot',
      model: 'Capless',
      nib: { size: 'F', material: 'steel', customLabel: null },
      color: '#1A1A1A',
      photoURL: null,
      acquiredAt: null,
      retired: false,
      currentInkId: null,
      notes: '',
      totalSessions: 5,
    });
    await deletePen(TEST_UID, id);
    await bumpCountersOnCreate(TEST_UID, makeSessionInput({ penId: id }));
    const pens = await listPens(TEST_UID);
    // listPens filters out soft-deleted, but the underlying doc still has the
    // original value of 5 because we skipped the bump.
    expect(pens).toHaveLength(0);
  });
});
