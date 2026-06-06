import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { withRetry } from '@/lib/retry/retry';
import type { WishlistItem } from '@/types/domain';

import {
  createWishlistItem,
  deleteWishlistItem,
  listWishlist,
  updateWishlistItem,
  type WishlistItemInput,
} from './wishlist';

export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: (uid: string) => [...wishlistKeys.all, 'list', uid] as const,
};

export function useWishlist(uid: string | null) {
  return useQuery({
    queryKey: uid ? wishlistKeys.list(uid) : wishlistKeys.all,
    queryFn: () => listWishlist(uid!),
    enabled: !!uid,
  });
}

export function useCreateWishlistItem(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WishlistItemInput) =>
      withRetry(() => createWishlistItem(uid!, input)),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}

export function useUpdateWishlistItem(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<WishlistItemInput> }) =>
      withRetry(() => updateWishlistItem(uid!, id, patch)),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}

export function useDeleteWishlistItem(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withRetry(() => deleteWishlistItem(uid!, id)),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}

export type { WishlistItem };
