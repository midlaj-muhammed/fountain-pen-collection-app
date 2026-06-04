/**
 * Tests for the Firestore wrapper. Validates that:
 *  - getDb() returns a singleton instance
 *  - userCollection(uid) returns a typed CollectionReference for the right path
 *  - enableOfflinePersistence() is a no-op stub for MVP (real impl in P3.8)
 */
import { getDb, userCollection, enableOfflinePersistence } from './firestore';

describe('getDb', () => {
  it('returns a Firestore instance', () => {
    const db = getDb();
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });

  it('returns the same instance on repeated calls (singleton)', () => {
    expect(getDb()).toBe(getDb());
  });
});

describe('userCollection', () => {
  it('builds a path under users/{uid}/{subcollection}', () => {
    const ref = userCollection('alice-uid', 'pens');
    // The mock path includes the literal strings; assert structure
    expect(ref).toBeDefined();
    // Path is on the internal _queryOptions of the mock
    expect((ref as unknown as { _path: { segments: string[] } })._path.segments).toEqual([
      'users',
      'alice-uid',
      'pens',
    ]);
  });

  it('rejects an empty uid', () => {
    expect(() => userCollection('', 'pens')).toThrow(/uid/);
  });

  it('rejects an empty subcollection', () => {
    expect(() => userCollection('uid', '')).toThrow(/subcollection/);
  });
});

describe('enableOfflinePersistence', () => {
  it('is callable and does not throw', () => {
    expect(() => enableOfflinePersistence()).not.toThrow();
  });
});
