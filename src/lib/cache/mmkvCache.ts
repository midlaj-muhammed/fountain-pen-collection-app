/**
 * Cold-start MMKV cache for the heaviest collections (pens, inks,
 * sessions). On read, the data layer writes a JSON snapshot here so
 * the next cold start can render the list before Firestore is online.
 *
 * Reads return `null` when the key is missing or the stored value is
 * corrupt; callers fall back to Firestore.
 */
import { MMKV } from 'react-native-mmkv';

const STORAGE_ID = 'mypen.cache.v1';
const mmkv = new MMKV({ id: STORAGE_ID });

const PREFIX = 'cache:';

export function saveCache<T>(key: string, value: T): void {
  try {
    mmkv.set(PREFIX + key, JSON.stringify(value));
  } catch {
    // Best-effort cache: a serialisation failure should never crash
    // the data path. The next read will simply miss.
  }
}

export function loadCache<T>(key: string): T | null {
  const raw = mmkv.getString(PREFIX + key);
  if (raw === undefined || raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAllCache(): void {
  mmkv.clearAll();
}

/**
 * Cold-start mirror helper: writes a typed snapshot of a Firestore
 * list response under a per-uid key. Pass the collection name as
 * `kind` (pens / inks / sessions / nibs / pensInUse / etc).
 */
export function mirrorListToCache<T>(uid: string, kind: string, list: T[]): void {
  saveCache(`${kind}:${uid}`, list);
}

export const __storageIdForDebug = STORAGE_ID;
