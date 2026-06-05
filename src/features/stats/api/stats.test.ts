/**
 * Tests for the stats aggregation. Pure functions over the pens/inks/
 * sessions data — no Firestore reads, no React. Mirrors what the
 * Cloud Function `monthlyStats` will eventually compute.
 */
import { Timestamp, type Timestamp as TimestampType } from 'firebase/firestore';

import type { Ink, Pen, Session } from '@/types/domain';

import {
  averageRating,
  filterSessions,
  monthlyBuckets,
  mostUsed,
  totalMinutes,
  totalSessions,
} from './aggregate';

const now = new Date('2026-06-05T12:00:00Z');

// The Jest Firestore mock doesn't implement Timestamp.fromDate;
// we build a Timestamp-shaped object by hand.
const mkTimestamp = (d: Date): TimestampType =>
  ({
    seconds: d.getTime() / 1000,
    nanoseconds: 0,
    toDate: () => d,
  } as unknown as TimestampType);

const mkPen = (id: string, brand: string, model: string): Pen => ({
  id,
  brand,
  model,
  nib: { size: 'F', material: 'steel', customLabel: null },
  color: '#1A1A1A',
  photoURL: null,
  acquiredAt: null,
  retired: false,
  currentInkId: null,
  notes: '',
  totalSessions: 0,
  createdAt: Timestamp.now() as never,
  updatedAt: Timestamp.now() as never,
  deletedAt: null,
});

const mkInk = (id: string, brand: string, name: string, level: 0 | 20 | 40 | 60 | 80 | 100): Ink => ({
  id,
  brand,
  name,
  colorHex: '#000000',
  colorName: 'Black',
  bottleSizeMl: 30,
  currentLevelPct: level,
  isCartridge: false,
  photoURL: null,
  acquiredAt: null,
  empty: false,
  totalSessions: 0,
  lastUsedAt: null,
  notes: '',
  createdAt: Timestamp.now() as never,
  updatedAt: Timestamp.now() as never,
  deletedAt: null,
});

const mkSession = (overrides: {
  id: string;
  penId: string;
  inkId: string;
  date?: Date;
  durationMin?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
}): Session => ({
  id: overrides.id,
  date: mkTimestamp(overrides.date ?? now),
  durationMin: overrides.durationMin ?? 15,
  penId: overrides.penId,
  inkId: overrides.inkId,
  inkDriedOut: false,
  rating: overrides.rating ?? 3,
  notes: '',
  createdAt: Timestamp.now() as never,
  updatedAt: Timestamp.now() as never,
  deletedAt: null,
});

describe('stats aggregation', () => {
  const pens: Pen[] = [mkPen('p1', 'Pilot', 'Capless'), mkPen('p2', 'Lamy', '2000')];
  const inks: Ink[] = [
    mkInk('i1', 'Pelikan', '4001', 60),
    mkInk('i2', 'Iroshizuku', 'Kon-peki', 20),
  ];
  const sessions: Session[] = [
    mkSession({ id: 's1', penId: 'p1', inkId: 'i1', date: now, durationMin: 30, rating: 4 }),
    mkSession({ id: 's2', penId: 'p1', inkId: 'i1', date: now, durationMin: 15, rating: 5 }),
    mkSession({ id: 's3', penId: 'p2', inkId: 'i2', date: now, durationMin: 45, rating: 3 }),
  ];

  describe('totalSessions / totalMinutes', () => {
    it('totalSessions returns the count', () => {
      expect(totalSessions(sessions)).toBe(3);
    });
    it('totalMinutes sums the durations', () => {
      expect(totalMinutes(sessions)).toBe(90);
    });
  });

  describe('averageRating', () => {
    it('returns 0 for an empty list', () => {
      expect(averageRating([])).toBe(0);
    });
    it('returns the mean of the ratings rounded to 1 dp', () => {
      expect(averageRating(sessions)).toBeCloseTo(4.0, 1);
    });
  });

  describe('mostUsed', () => {
    it('returns pens ranked by session count, with the entity', () => {
      const result = mostUsed(sessions, pens, 'penId');
      expect(result[0]?.id).toBe('p1');
      expect(result[0]?.count).toBe(2);
      expect(result[0]?.entity?.brand).toBe('Pilot');
      expect(result[1]?.id).toBe('p2');
    });
    it('returns inks ranked by session count', () => {
      const result = mostUsed(sessions, inks, 'inkId');
      expect(result[0]?.id).toBe('i1');
      expect(result[0]?.count).toBe(2);
    });
  });

  describe('monthlyBuckets', () => {
    it('groups sessions by YYYY-MM and sorts newest-first', () => {
      const s1 = mkSession({
        id: 'a',
        penId: 'p1',
        inkId: 'i1',
        date: new Date('2026-05-15'),
      });
      const s2 = mkSession({
        id: 'b',
        penId: 'p1',
        inkId: 'i1',
        date: new Date('2026-06-02'),
      });
      const s3 = mkSession({
        id: 'c',
        penId: 'p1',
        inkId: 'i1',
        date: new Date('2026-06-04'),
      });
      const result = monthlyBuckets([s1, s2, s3]);
      expect(result[0]?.key).toBe('2026-06');
      expect(result[0]?.count).toBe(2);
      expect(result[1]?.key).toBe('2026-05');
      expect(result[1]?.count).toBe(1);
    });
  });

  describe('filterSessions', () => {
    it('returns the same list when no filters are applied', () => {
      expect(filterSessions(sessions, {})).toHaveLength(3);
    });
    it('filters by penIds', () => {
      const out = filterSessions(sessions, { penIds: ['p1'] });
      expect(out).toHaveLength(2);
    });
    it('filters by inkIds', () => {
      const out = filterSessions(sessions, { inkIds: ['i2'] });
      expect(out).toHaveLength(1);
    });
    it('filters by rating (>=)', () => {
      const out = filterSessions(sessions, { rating: 4 });
      expect(out).toHaveLength(2);
    });
    it('filters by date range', () => {
      const out = filterSessions(sessions, {
        from: new Date('2026-06-05T00:00:00Z'),
        to: new Date('2026-06-05T23:59:59Z'),
      });
      expect(out).toHaveLength(3);
    });
  });
});
