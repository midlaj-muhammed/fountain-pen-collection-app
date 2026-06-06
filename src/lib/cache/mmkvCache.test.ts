/**
 * Tests for the cold-start mirror. Pure serialisation logic against
 * the AsyncStorage mock (a Map-backed store).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearAllCache, loadCache, saveCache } from './mmkvCache';

const mockedAsyncStorage = AsyncStorage as unknown as {
  __resetStore: () => void;
  getItem: jest.Mock;
  setItem: jest.Mock;
};

describe('mmkvCache', () => {
  beforeEach(() => {
    // Wipe the in-memory mock between tests.
    mockedAsyncStorage.__resetStore();
  });

  it('saveCache then loadCache round-trips a value', async () => {
    await saveCache('pens', [{ id: 'p1', brand: 'Pilot' }]);
    expect(await loadCache<{ id: string; brand: string }[]>('pens')).toEqual([
      { id: 'p1', brand: 'Pilot' },
    ]);
  });

  it('loadCache returns null when the key is missing', async () => {
    expect(await loadCache('inks')).toBeNull();
  });

  it('saveCache overwrites a previous value', async () => {
    await saveCache('sessions', [{ id: 's1' }]);
    await saveCache('sessions', [{ id: 's2' }]);
    expect(await loadCache<{ id: string }[]>('sessions')).toEqual([{ id: 's2' }]);
  });

  it('clearAllCache wipes every key', async () => {
    await saveCache('pens', [1]);
    await saveCache('inks', [2]);
    await clearAllCache();
    expect(await loadCache('pens')).toBeNull();
    expect(await loadCache('inks')).toBeNull();
  });

  it('rejects non-serialisable values by returning null on load', async () => {
    // Hand-craft a poisoned entry: invalid JSON, so the load should
    // fail and the caller falls back to Firestore.
    const fullKey = 'mypen.cache.v1:cache:broken';
    await mockedAsyncStorage.setItem(fullKey, 'not-json{');
    expect(await loadCache('broken')).toBeNull();
  });
});
