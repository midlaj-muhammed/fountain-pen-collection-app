/**
 * Calendar data layer. Pure functions that derive a per-day view of
 * the user's writing history from the existing `Session` collection.
 *
 * The Session record's `date` is a Firestore Timestamp; we convert to
 * the user's local time and bucket into `YYYY-MM-DD` strings so they
 * can be passed straight to `react-native-calendars`.
 *
 * Keeping these as pure helpers (not React hooks) makes them easy
 * to unit-test without rendering.
 */
import type { Session, ISODate } from '@/types/domain';

/** Returns the local `YYYY-MM-DD` for a Session's `date` field. */
export function sessionDateKey(session: Session): ISODate | null {
  if (!session.date) return null;
  // Firestore Timestamp has toDate(); the test mock sometimes hands
  // back a plain Date or { seconds }. Handle both.
  const d: Date =
    typeof (session.date as { toDate?: () => Date }).toDate === 'function'
      ? (session.date as { toDate: () => Date }).toDate()
      : new Date((session.date as unknown as { seconds: number }).seconds * 1000);
  if (isNaN(d.getTime())) return null;
  return toISODateKey(d);
}

/** Format a Date as `YYYY-MM-DD` in the local timezone. */
export function toISODateKey(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Given a list of sessions, return the set of date keys (one per
 * day) that have at least one session. Used to drive the dot
 * markers on the calendar.
 */
export function sessionDateKeys(sessions: Session[]): ISODate[] {
  const set = new Set<ISODate>();
  for (const s of sessions) {
    const key = sessionDateKey(s);
    if (key) set.add(key);
  }
  return Array.from(set).sort();
}

/** Subset of sessions whose date matches the given key. */
export function sessionsOnDate(sessions: Session[], key: ISODate): Session[] {
  return sessions.filter((s) => sessionDateKey(s) === key);
}

/**
 * Compute the month grid (6 rows × 7 columns) for the given year/
 * month, with each cell's date key and which row/col it occupies.
 * The grid always starts on a Sunday (US-style) since
 * `react-native-calendars` handles its own week start.
 */
export function monthGrid(year: number, monthIndex0: number): {
  date: Date;
  key: ISODate;
  inMonth: boolean;
}[] {
  const first = new Date(year, monthIndex0, 1);
  const startWeekday = first.getDay(); // 0=Sun..6=Sat
  const start = new Date(year, monthIndex0, 1 - startWeekday);
  const cells: { date: Date; key: ISODate; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({
      date: d,
      key: toISODateKey(d),
      inMonth: d.getMonth() === monthIndex0,
    });
  }
  return cells;
}
