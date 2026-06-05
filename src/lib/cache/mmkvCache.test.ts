/**
 * Tests for the MMKV cold-start mirror. Pure serialisation logic
 * against the Jest MMKV mock (a Map-backed store).
 */
import { MMKV } from 'react-native-mmkv';

import { clearAllCache, loadCache, saveCache } from './mmkvCache';

describe('mmkvCache', () => {
  beforeEach(() => {
    // Wipe the in-memory mock between tests.
    new MMKV().clearAll();
  });

  it('saveCache then loadCache round-trips a value', () => {
    saveCache('pens', [{ id: 'p1', brand: 'Pilot' }]);
    expect(loadCache<{ id: string; brand: string }[]>('pens')).toEqual([
      { id: 'p1', brand: 'Pilot' },
    ]);
  });

  it('loadCache returns null when the key is missing', () => {
    expect(loadCache('inks')).toBeNull();
  });

  it('saveCache overwrites a previous value', () => {
    saveCache('sessions', [{ id: 's1' }]);
    saveCache('sessions', [{ id: 's2' }]);
    expect(loadCache<{ id: string }[]>('sessions')).toEqual([{ id: 's2' }]);
  });

  it('clearAllCache wipes every key', () => {
    saveCache('pens', [1]);
    saveCache('inks', [2]);
    clearAllCache();
    expect(loadCache('pens')).toBeNull();
    expect(loadCache('inks')).toBeNull();
  });

  it('rejects non-serialisable values by returning null on load', () => {
    // Hand-craft a poisoned entry: undefined is not valid JSON, so the
    // load should fail and the caller falls back to Firestore.
    const mmkv = new MMKV();
    mmkv.set('broken', 'not-json{');
    expect(loadCache('broken')).toBeNull();
  });
});
