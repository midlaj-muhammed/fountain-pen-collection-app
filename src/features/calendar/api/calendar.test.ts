/**
 * Pure-function tests for the Calendar data layer. No React,
 * no Firestore — these helpers are the only thing the screen
 * depends on for date math, so getting them right matters more
 * than any UI assertion.
 */
import type { Session } from '@/types/domain';

import {
  monthGrid,
  sessionDateKey,
  sessionDateKeys,
  sessionsOnDate,
  toISODateKey,
} from './calendar';

function ts(d: Date) {
  return { toDate: () => d } as unknown as Session['date'];
}

function makeSession(date: Date, overrides: Partial<Session> = {}): Session {
  return {
    id: overrides.id ?? 's1',
    date: ts(date),
    durationMin: overrides.durationMin ?? 15,
    penId: overrides.penId ?? 'p1',
    inkId: overrides.inkId ?? 'i1',
    inkDriedOut: overrides.inkDriedOut ?? false,
    rating: overrides.rating ?? 4,
    notes: overrides.notes ?? '',
    createdAt: ts(date),
    updatedAt: ts(date),
    deletedAt: overrides.deletedAt ?? null,
  };
}

describe('toISODateKey', () => {
  it('formats local date as YYYY-MM-DD', () => {
    expect(toISODateKey(new Date(2026, 5, 6))).toBe('2026-06-06');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toISODateKey(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('sessionDateKey', () => {
  it('returns the local date key for a Timestamp', () => {
    const s = makeSession(new Date(2026, 5, 6, 14, 30));
    expect(sessionDateKey(s)).toBe('2026-06-06');
  });

  it('returns null when the date is missing', () => {
    const s = makeSession(new Date());
    (s as unknown as { date: null }).date = null;
    expect(sessionDateKey(s)).toBeNull();
  });

  it('returns null when the date is corrupt', () => {
    const s = makeSession(new Date());
    (s as unknown as { date: object }).date = { seconds: 'not a number' } as unknown as Session['date'];
    expect(sessionDateKey(s)).toBeNull();
  });
});

describe('sessionDateKeys', () => {
  it('dedupes multiple sessions on the same day', () => {
    const sessions = [
      makeSession(new Date(2026, 5, 6, 9, 0), { id: 'a' }),
      makeSession(new Date(2026, 5, 6, 18, 0), { id: 'b' }),
      makeSession(new Date(2026, 5, 7, 10, 0), { id: 'c' }),
    ];
    expect(sessionDateKeys(sessions)).toEqual(['2026-06-06', '2026-06-07']);
  });
});

describe('sessionsOnDate', () => {
  it('returns only sessions matching the key', () => {
    const sessions = [
      makeSession(new Date(2026, 5, 6, 9), { id: 'a' }),
      makeSession(new Date(2026, 5, 7, 9), { id: 'b' }),
    ];
    const result = sessionsOnDate(sessions, '2026-06-06');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('a');
  });
});

describe('monthGrid', () => {
  it('starts the grid on Sunday and pads the trailing month', () => {
    // June 2026: 1st is a Monday, so the grid starts on Sun May 31.
    const cells = monthGrid(2026, 5);
    expect(cells).toHaveLength(42);
    expect(cells[0]?.key).toBe('2026-05-31');
    expect(cells[0]?.inMonth).toBe(false);
    // The first in-month cell is the 1st.
    const firstIn = cells.find((c) => c.inMonth);
    expect(firstIn?.key).toBe('2026-06-01');
  });

  it('ends with the trailing days of the next month', () => {
    const cells = monthGrid(2026, 5);
    expect(cells[41]?.inMonth).toBe(false);
  });
});
