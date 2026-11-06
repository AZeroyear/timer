import { dayKey, recordSession, streakOf, summarize } from './stats';

beforeEach(() => window.localStorage.clear());

test('streak counts consecutive days back from today', () => {
  const today = new Date(2026, 10, 6);
  expect(streakOf([], today)).toBe(0);
  expect(streakOf(['2026-11-06'], today)).toBe(1);
  expect(streakOf(['2026-11-04', '2026-11-05', '2026-11-06'], today)).toBe(3);
  // a gap ends the streak
  expect(streakOf(['2026-11-03', '2026-11-05', '2026-11-06'], today)).toBe(2);
  // nothing today means no current streak
  expect(streakOf(['2026-11-05'], today)).toBe(0);
});

test('recordSession counts sessions and days', () => {
  recordSession(new Date(2026, 10, 5, 9));
  recordSession(new Date(2026, 10, 6, 9));
  const stats = recordSession(new Date(2026, 10, 6, 18));
  expect(stats.sessions).toBe(3);
  expect(stats.days).toEqual(['2026-11-05', '2026-11-06']);
  expect(summarize(stats, new Date(2026, 10, 6))).toEqual({
    sessions: 3,
    streak: 2,
  });
  expect(dayKey(new Date(2026, 0, 2))).toBe('2026-01-02');
});
