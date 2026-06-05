import { useMemo } from 'react';

import { useInks } from '@/features/inks/api/queries';
import { usePens } from '@/features/pens/api/queries';
import { useSessions } from '@/features/sessions/api/queries';
import type { Ink, Pen } from '@/types/domain';

import {
  averageRating,
  currentStreak,
  filterSessions,
  monthlyBuckets,
  mostUsed,
  type MostUsed,
  type SessionFilters,
  totalMinutes,
  totalSessions,
} from './aggregate';

export type Stats = {
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  streak: number;
  topPens: MostUsed<Pen>[];
  topInks: MostUsed<Ink>[];
  monthly: ReturnType<typeof monthlyBuckets>;
};

/**
 * Aggregate client-side stats from the active pens / inks / sessions
 * queries. Pure function over the data already in cache — no new
 * Firestore reads. Mirrors what the Cloud Function `monthlyStats`
 * will pre-aggregate so the UI is fast and works offline.
 */
export function useStats(uid: string | null, filters: SessionFilters = {}): Stats | null {
  const { data: sessions } = useSessions(uid);
  const { data: pens } = usePens(uid);
  const { data: inks } = useInks(uid);

  return useMemo<Stats | null>(() => {
    if (!sessions || !pens || !inks) return null;
    const filtered = filterSessions(sessions, filters);
    return {
      totalSessions: totalSessions(filtered),
      totalMinutes: totalMinutes(filtered),
      averageRating: averageRating(filtered),
      streak: currentStreak(filtered),
      topPens: mostUsed<Pen>(filtered, pens, 'penId'),
      topInks: mostUsed<Ink>(filtered, inks, 'inkId'),
      monthly: monthlyBuckets(filtered),
    };
  }, [sessions, pens, inks, filters]);
}
