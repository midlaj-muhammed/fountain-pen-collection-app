import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Ink } from '@/types/domain';

import {
  createInk,
  deleteInk,
  getInk,
  listInks,
  type InkInput,
  updateInk,
} from './inks';

/** Query keys — keep them centralized so mutations can invalidate cleanly. */
export const inkKeys = {
  all: ['inks'] as const,
  list: (uid: string) => [...inkKeys.all, 'list', uid] as const,
  detail: (uid: string, inkId: string) => [...inkKeys.all, 'detail', uid, inkId] as const,
};

/** All active inks for a user. */
export function useInks(uid: string | null) {
  return useQuery({
    queryKey: uid ? inkKeys.list(uid) : inkKeys.all,
    queryFn: () => listInks(uid!),
    enabled: !!uid,
  });
}

/** A single ink by id. */
export function useInk(uid: string | null, inkId: string | null) {
  return useQuery({
    queryKey: uid && inkId ? inkKeys.detail(uid, inkId) : inkKeys.all,
    queryFn: () => getInk(uid!, inkId!),
    enabled: !!uid && !!inkId,
  });
}

export function useCreateInk(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InkInput) => createInk(uid!, input),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: inkKeys.list(uid) });
    },
  });
}

export function useUpdateInk(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ inkId, patch }: { inkId: string; patch: Partial<InkInput> }) =>
      updateInk(uid!, inkId, patch),
    onSuccess: (_data, vars) => {
      if (uid) {
        qc.invalidateQueries({ queryKey: inkKeys.list(uid) });
        qc.invalidateQueries({ queryKey: inkKeys.detail(uid, vars.inkId) });
      }
    },
  });
}

export function useDeleteInk(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inkId: string) => deleteInk(uid!, inkId),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: inkKeys.list(uid) });
    },
  });
}

/** Helper to keep callers typing-friendly when they don't have an Ink type. */
export type { Ink };
