/**
 * Wishlist data layer. CRUD against the user's `wishlist`
 * subcollection. The collection is intentionally denormalised
 * (brand + name captured at wishlist time) so an item still reads
 * correctly even after the matching pen/ink is deleted.
 */
import {
  type CollectionReference,
  type DocumentReference,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { mirrorListToCache } from '@/lib/cache/mmkvCache';
import { userCollection } from '@/lib/firebase';
import type { WishlistItem } from '@/types/domain';

export function wishlistCollection(uid: string): CollectionReference<WishlistItem> {
  return userCollection<WishlistItem>(uid, 'wishlist');
}

export function wishlistDoc(uid: string, id: string): DocumentReference<WishlistItem> {
  return doc(wishlistCollection(uid), id);
}

export function wishlistQuery(uid: string) {
  return query(
    wishlistCollection(uid),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc'),
  );
}

export type WishlistItemInput = Omit<
  WishlistItem,
  'id' | 'createdAt' | 'deletedAt'
>;

export async function createWishlistItem(
  uid: string,
  input: WishlistItemInput,
): Promise<string> {
  const now = new Date();
  const ref = await addDoc(wishlistCollection(uid), {
    ...input,
    createdAt: now,
    deletedAt: null,
  } as unknown as WishlistItem);
  return ref.id;
}

export async function getWishlistItem(
  uid: string,
  id: string,
): Promise<WishlistItem | null> {
  const snap = await getDoc(wishlistDoc(uid, id));
  return snap.exists() ? (snap.data() as WishlistItem) : null;
}

export async function updateWishlistItem(
  uid: string,
  id: string,
  patch: Partial<WishlistItemInput>,
): Promise<void> {
  await updateDoc(wishlistDoc(uid, id), patch as unknown as Partial<WishlistItem>);
}

export async function deleteWishlistItem(uid: string, id: string): Promise<void> {
  // Soft delete so a future "Undo" affordance is trivial; the
  // wishlistQuery already filters on deletedAt == null.
  await updateDoc(wishlistDoc(uid, id), {
    deletedAt: new Date(),
  } as unknown as Partial<WishlistItem>);
}

export async function purgeWishlistItem(uid: string, id: string): Promise<void> {
  await deleteDoc(wishlistDoc(uid, id));
}

export async function listWishlist(uid: string): Promise<WishlistItem[]> {
  const snap = await getDocs(wishlistQuery(uid));
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<WishlistItem, 'id'>),
  }));
  mirrorListToCache(uid, 'wishlist', list);
  return list;
}
