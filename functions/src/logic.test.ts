/**
 * Unit tests for the pure business logic inside Cloud Functions.
 * The firebase-admin SDK calls are mocked in the wrapper tests; here
 * we test the math.
 *
 * RED: these tests should fail because src/logic.ts doesn't exist
 * yet. After implementing logic.ts, they should pass.
 */
import {
  applySessionDelta,
  bucketForMonth,
  computeMonthlyBuckets,
  planUserDataDeletion,
} from './logic';

describe('bucketForMonth', () => {
  it('returns "YYYY-MM" for a Date in the user’s local timezone', () => {
    expect(bucketForMonth(new Date('2026-06-05T12:00:00Z'))).toBe('2026-06');
  });
  it('rolls over to the next month correctly', () => {
    expect(bucketForMonth(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01');
  });
});

describe('applySessionDelta', () => {
  it('returns +1 for create, -1 for delete, no-op for update', () => {
    expect(applySessionDelta('create', { penId: 'p1', inkId: 'i1' })).toEqual({
      penDelta: { id: 'p1', delta: 1 },
      inkDelta: { id: 'i1', delta: 1 },
    });
    expect(applySessionDelta('delete', { penId: 'p1', inkId: 'i1' })).toEqual({
      penDelta: { id: 'p1', delta: -1 },
      inkDelta: { id: 'i1', delta: -1 },
    });
    expect(applySessionDelta('update', { penId: 'p1', inkId: 'i1' })).toBeNull();
  });
});

describe('computeMonthlyBuckets', () => {
  it('groups session counts and minutes by YYYY-MM', () => {
    const buckets = computeMonthlyBuckets([
      { date: new Date('2026-05-15'), durationMin: 30 },
      { date: new Date('2026-06-01'), durationMin: 20 },
      { date: new Date('2026-06-15'), durationMin: 40 },
      { date: new Date('2026-07-01'), durationMin: 10 },
    ]);
    expect(buckets).toEqual([
      { key: '2026-07', count: 1, minutes: 10 },
      { key: '2026-06', count: 2, minutes: 60 },
      { key: '2026-05', count: 1, minutes: 30 },
    ]);
  });
});

describe('planUserDataDeletion', () => {
  it('returns the list of paths and storage prefixes to delete', () => {
    const plan = planUserDataDeletion('alice-uid');
    expect(plan.firestorePaths).toContain('users/alice-uid');
    expect(plan.firestorePaths).toContain('users/alice-uid/pens');
    expect(plan.firestorePaths).toContain('users/alice-uid/inks');
    expect(plan.firestorePaths).toContain('users/alice-uid/sessions');
    expect(plan.storagePrefixes).toContain('users/alice-uid/');
  });
});
