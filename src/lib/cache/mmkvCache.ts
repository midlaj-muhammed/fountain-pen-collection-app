/**
 * Cold-start cache for the heaviest collections (pens, inks, sessions).
 * On read, the data layer writes a JSON snapshot here so the next cold
 * start can render the list before Firestore is online.
 *
 * Reads return `null` when the key is missing or the stored value is
 * corrupt; callers fall back to Firestore.
 *
 * Implementation note: previously backed by react-native-mmkv, which
 * is not compatible with RN 0.74+. We use AsyncStorage with a single
 * key prefix (`STORAGE_ID` + ':') to emulate the old per-MMKV-file
 * scope. `clearAllCache` enumerates and removes only the prefixed
 * keys so we never accidentally wipe the rest of the app's storage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_ID = 'mypen.cache.v1';
const PREFIX = `${STORAGE_ID}:`;
const USER_PREFIX = `${PREFIX}cache:`;

function fullKey(userKey: string): string {
  return USER_PREFIX + userKey;
}

export async function saveCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(fullKey(key), JSON.stringify(value));
  } catch {
    // Best-effort cache: a serialisation failure should never crash
    // the data path. The next read will simply miss.
  }
}

export async function loadCache<T>(key: string): Promise<T | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(fullKey(key));
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const all = await AsyncStorage.getAllKeys();
    const ours = all.filter((k) => k.startsWith(PREFIX));
    if (ours.length > 0) {
      await AsyncStorage.multiRemove(ours);
    }
  } catch {
    // Best-effort: a failure to clear should never crash the caller.
  }
}

/**
 * Cold-start mirror helper: writes a typed snapshot of a Firestore
 * list response under a per-uid key. Pass the collection name as
 * `kind` (pens / inks / sessions / nibs / pensInUse / etc).
 */
export function mirrorListToCache<T>(uid: string, kind: string, list: T[]): Promise<void> {
  // Fire-and-forget from the caller's perspective. saveCache catches its
  // own write errors, but the returned promise is still unhandled at the
  // call site (callers don't await) — attach a no-op catch to keep the
  // unhandled-rejection surface clean.
  return saveCache(`${kind}:${uid}`, list).catch(() => undefined);
}

export const __storageIdForDebug = STORAGE_ID;
