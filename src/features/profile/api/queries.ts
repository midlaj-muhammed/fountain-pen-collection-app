import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { User } from '@/types/domain';

import { getUser, updateUser, type UserInput } from './users';

export const userKeys = {
  all: ['users'] as const,
  detail: (uid: string) => [...userKeys.all, 'detail', uid] as const,
};

export function useUser(uid: string | null) {
  return useQuery({
    queryKey: uid ? userKeys.detail(uid) : userKeys.all,
    queryFn: () => getUser(uid!),
    enabled: !!uid,
  });
}

export function useUpdateUser(uid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserInput>) => updateUser(uid!, patch),
    onSuccess: () => {
      if (uid) qc.invalidateQueries({ queryKey: userKeys.detail(uid) });
    },
  });
}

export type { User };
