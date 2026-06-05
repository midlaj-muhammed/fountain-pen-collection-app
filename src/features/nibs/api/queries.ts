import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NibSwap } from '@/types/domain';

import {
  createNibSwap,
  deleteNibSwap,
  listNibSwaps,
  type NibSwapInput,
  updateNibSwap,
} from './nibs';

export const nibKeys = {
  all: ['nibSwaps'] as const,
  list: (uid: string, penId: string) => [...nibKeys.all, 'list', uid, penId] as const,
};

export function useNibSwaps(uid: string | null, penId: string | null) {
  return useQuery({
    queryKey: uid && penId ? nibKeys.list(uid, penId) : nibKeys.all,
    queryFn: () => listNibSwaps(uid!, penId!),
    enabled: !!uid && !!penId,
  });
}

export function useCreateNibSwap(uid: string | null, penId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NibSwapInput) => createNibSwap(uid!, penId!, input),
    onSuccess: () => {
      if (uid && penId) qc.invalidateQueries({ queryKey: nibKeys.list(uid, penId) });
    },
  });
}

export function useUpdateNibSwap(uid: string | null, penId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      swapId,
      patch,
    }: {
      swapId: string;
      patch: Partial<NibSwapInput>;
    }) => updateNibSwap(uid!, penId!, swapId, patch),
    onSuccess: () => {
      if (uid && penId) qc.invalidateQueries({ queryKey: nibKeys.list(uid, penId) });
    },
  });
}

export function useDeleteNibSwap(uid: string | null, penId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) => deleteNibSwap(uid!, penId!, swapId),
    onSuccess: () => {
      if (uid && penId) qc.invalidateQueries({ queryKey: nibKeys.list(uid, penId) });
    },
  });
}

export type { NibSwap };
