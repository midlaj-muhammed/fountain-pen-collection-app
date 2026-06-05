/**
 * Stats aggregation — pure functions over the pens / inks / sessions
 * data. Mirrors what the Cloud Function `monthlyStats` (see SPEC §7.3)
 * will pre-aggregate to `users/{uid}/stats/{YYYY-MM}` on a schedule;
 * the client uses these functions today to render the Stats screen
 * without waiting for the function.
 */
import type { Session } from '@/types/domain';

export type SessionFilters = {
  from?: Date;
  to?: Date;
  penIds?: string[];
  inkIds?: string[];
  rating?: number;
};

export function filterSessions(sessions: Session[], filters: SessionFilters): Session[] {
  return sessions.filter((s) => {
    if (filters.penIds && !filters.penIds.includes(s.penId)) return false;
    if (filters.inkIds && !filters.inkIds.includes(s.inkId)) return false;
    if (typeof filters.rating === 'number' && s.rating < filters.rating) return false;
    const d = toDate(s.date);
    if (filters.from && d < filters.from) return false;
    if (filters.to && d > filters.to) return false;
    return true;
  });
}

export function totalSessions(sessions: Session[]): number {
  return sessions.length;
}

export function totalMinutes(sessions: Session[]): number {
  return sessions.reduce((acc, s) => acc + s.durationMin, 0);
}

export function averageRating(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const sum = sessions.reduce((acc, s) => acc + s.rating, 0);
  return Math.round((sum / sessions.length) * 10) / 10;
}

export type MostUsed<T> = {
  id: string;
  count: number;
  entity: T | undefined;
};

export function mostUsed<T extends { id: string }>(
  sessions: Session[],
  entities: T[],
  key: 'penId' | 'inkId',
): MostUsed<T>[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    counts.set(s[key], (counts.get(s[key]) ?? 0) + 1);
  }
  const byId = new Map<string, T>();
  for (const e of entities) byId.set(e.id, e);
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, count, entity: byId.get(id) }))
    .sort((a, b) => b.count - a.count);
}

export type MonthlyBucket = {
  /** YYYY-MM */
  key: string;
  count: number;
  minutes: number;
};

export function monthlyBuckets(sessions: Session[]): MonthlyBucket[] {
  const map = new Map<string, MonthlyBucket>();
  for (const s of sessions) {
    const d = toDate(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = map.get(key) ?? { key, count: 0, minutes: 0 };
    existing.count += 1;
    existing.minutes += s.durationMin;
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

/** Current streak: consecutive days, ending today, with at least one session. */
export function currentStreak(sessions: Session[], now: Date = new Date()): number {
  if (sessions.length === 0) return 0;
  const days = new Set<string>();
  for (const s of sessions) {
    const d = toDate(s.date);
    days.add(d.toISOString().slice(0, 10));
  }
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toDate(value: Session['date']): Date {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value && typeof (value as { seconds?: number }).seconds === 'number') {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return new Date();
}
