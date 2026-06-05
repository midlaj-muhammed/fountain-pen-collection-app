import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Session } from '@/types/domain';

import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  type SessionInput,
  updateSession,
} from './sessions';

export const sessionKeys = {
  all: ['sessions'] as const,
  list: (uid: string) => [...sessionKeys.all, 'list', uid] as const,
  detail: (uid: string, id: string) => [...sessionKeys.all, 'detail', uid, id] as const,
};

export function useSessions(uid: string | null) {
  return useQuery({
    queryKey: uid ? sessionKeys.list(uid) : sessionKeys.all,
    queryFn: () => listSessions(uid!),
    enabled: !!uid,
  });
}

export function useSession(uid: string | null, id: string | null) {
  return useQuery({
    queryKey: uid && id ? sessionKeys.detail(uid, id) : sessionKeys.all,
    queryFn: () => getSession(uid!, id!),
    enabled: !!uid && !!id,
  });
}

export function useCreateSession(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SessionInput) => createSession(uid!, input),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: sessionKeys.list(uid) });
    },
  });
}

export function useUpdateSession(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SessionInput> }) =>
      updateSession(uid!, id, patch),
    onSuccess: (_data, vars) => {
      if (uid) {
        qc.invalidateQueries({ queryKey: sessionKeys.list(uid) });
        qc.invalidateQueries({ queryKey: sessionKeys.detail(uid, vars.id) });
      }
    },
  });
}

export function useDeleteSession(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSession(uid!, id),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: sessionKeys.list(uid) });
    },
  });
}

export type { Session };
