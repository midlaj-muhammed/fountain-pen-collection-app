import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { inkKeys } from '@/features/inks/api/queries';
import { penKeys } from '@/features/pens/api/queries';
import type { Session } from '@/types/domain';

import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  type SessionInput,
  updateSession,
} from './sessions';
import { bumpCountersOnCreate, bumpCountersOnDelete } from './sessionsCounters';

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
    mutationFn: async (input: SessionInput) => {
      const id = await createSession(uid!, input);
      // Mirror the Cloud Function `onSessionWrite` side-effect so the UI
      // counter is correct immediately. If the side-effect fails the
      // session is still created; the Cloud Function is the source of
      // truth and will reconcile on the next write.
      try {
        await bumpCountersOnCreate(uid!, input);
      } catch {
        // intentionally swallow; counters will be repaired server-side
      }
      return id;
    },
    onSuccess: () => {
      if (uid) {
        qc.invalidateQueries({ queryKey: sessionKeys.list(uid) });
        qc.invalidateQueries({ queryKey: inkKeys.list(uid) });
        qc.invalidateQueries({ queryKey: penKeys.list(uid) });
      }
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
    mutationFn: async (id: string) => {
      const existing = await getSession(uid!, id);
      if (existing) {
        try {
          await bumpCountersOnDelete(uid!, existing);
        } catch {
          // intentionally swallow
        }
      }
      await deleteSession(uid!, id);
    },
    onSuccess: () => {
      if (uid) {
        qc.invalidateQueries({ queryKey: sessionKeys.list(uid) });
        qc.invalidateQueries({ queryKey: inkKeys.list(uid) });
        qc.invalidateQueries({ queryKey: penKeys.list(uid) });
      }
    },
  });
}

export type { Session };
