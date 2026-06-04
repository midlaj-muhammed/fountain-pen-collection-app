import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Pen } from '@/types/domain';

import {
  createPen,
  deletePen,
  getPen,
  listPens,
  type PenInput,
  updatePen,
} from './pens';

/** Query keys — keep them centralized so mutations can invalidate cleanly. */
export const penKeys = {
  all: ['pens'] as const,
  list: (uid: string) => [...penKeys.all, 'list', uid] as const,
  detail: (uid: string, penId: string) => [...penKeys.all, 'detail', uid, penId] as const,
};

/** All active pens for a user. */
export function usePens(uid: string | null) {
  return useQuery({
    queryKey: uid ? penKeys.list(uid) : penKeys.all,
    queryFn: () => listPens(uid!),
    enabled: !!uid,
  });
}

/** A single pen by id. */
export function usePen(uid: string | null, penId: string | null) {
  return useQuery({
    queryKey: uid && penId ? penKeys.detail(uid, penId) : penKeys.all,
    queryFn: () => getPen(uid!, penId!),
    enabled: !!uid && !!penId,
  });
}

export function useCreatePen(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PenInput) => createPen(uid!, input),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: penKeys.list(uid) });
    },
  });
}

export function useUpdatePen(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ penId, patch }: { penId: string; patch: Partial<PenInput> }) =>
      updatePen(uid!, penId, patch),
    onSuccess: (_data, vars) => {
      if (uid) {
        qc.invalidateQueries({ queryKey: penKeys.list(uid) });
        qc.invalidateQueries({ queryKey: penKeys.detail(uid, vars.penId) });
      }
    },
  });
}

export function useDeletePen(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (penId: string) => deletePen(uid!, penId),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: penKeys.list(uid) });
    },
  });
}

/** Helper to keep callers typing-friendly when they don't have a Pen type. */
export type { Pen };
