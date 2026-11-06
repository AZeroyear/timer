export const STATS_KEY = 'loopy-timer:stats';

/** Finished sessions, and the (local) days on which one was finished. */
export type Stats = { sessions: number; days: string[] };

const KEEP_DAYS = 400;

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, n: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + n);

  return next;
};

/** Consecutive days with a finished session, counting back from `today`. */
export const streakOf = (days: string[], today: Date): number => {
  const set = new Set(days);
  let streak = 0;
  for (let d = today; set.has(dayKey(d)); d = addDays(d, -1)) streak += 1;

  return streak;
};

export const loadStats = (): Stats => {
  try {
    const raw: unknown = JSON.parse(
      window.localStorage.getItem(STATS_KEY) ?? 'null',
    );
    if (raw && typeof raw === 'object') {
      const { sessions, days } = raw as Partial<Stats>;

      return {
        sessions:
          typeof sessions === 'number' && sessions > 0
            ? Math.floor(sessions)
            : 0,
        days: Array.isArray(days)
          ? days.filter((d): d is string => typeof d === 'string')
          : [],
      };
    }
  } catch {
    // ignore
  }

  return { sessions: 0, days: [] };
};

/** Counts one finished session (call once per completed timer). */
export const recordSession = (date: Date = new Date()): Stats => {
  const stats = loadStats();
  const today = dayKey(date);
  const next: Stats = {
    sessions: stats.sessions + 1,
    days: Array.from(new Set([...stats.days, today]))
      .sort()
      .slice(-KEEP_DAYS),
  };
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }

  return next;
};

export const summarize = (
  stats: Stats,
  today: Date = new Date(),
): { sessions: number; streak: number } => ({
  sessions: stats.sessions,
  streak: streakOf(stats.days, today),
});
