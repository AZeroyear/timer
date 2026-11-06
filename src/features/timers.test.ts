import { parseTimers } from './timers';

describe('parseTimers', () => {
  it('returns null for empty or broken data', () => {
    expect(parseTimers(null)).toBeNull();
    expect(parseTimers('not json')).toBeNull();
    expect(parseTimers('{"timers":1}')).toBeNull();
  });

  it('clamps settings and fills in missing fields', () => {
    const [t] =
      parseTimers(
        JSON.stringify({
          timers: [{ settings: { work: 99999, rounds: 0 }, name: '' }],
        }),
      ) ?? [];
    expect(t.settings.work).toBe(3600);
    expect(t.settings.rounds).toBe(1);
    expect(t.name).toBe('Timer');
    expect(t.run.running).toBe(false);
  });

  it('ignores a running flag without a start time', () => {
    const [t] =
      parseTimers(
        JSON.stringify({ timers: [{ run: { running: true, startedAt: 0 } }] }),
      ) ?? [];
    expect(t.run.running).toBe(false);
  });
});
