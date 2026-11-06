import {
  buildSegments,
  computeProgress,
  defaultSettings,
  formatTime,
  totalDuration,
} from './tabata';

describe('buildSegments', () => {
  const segments = buildSegments(defaultSettings);

  it('default is prepare + 8 work + 7 rest = 4:00 + 10s', () => {
    expect(segments.filter((s) => s.phase === 'work')).toHaveLength(8);
    expect(segments.filter((s) => s.phase === 'rest')).toHaveLength(7);
    expect(totalDuration(segments)).toBe(10000 + 8 * 20000 + 7 * 10000);
  });

  it('skips the last rest and the set rest after the last set', () => {
    const last = segments[segments.length - 1];
    expect(last.phase).toBe('work');
    const multi = buildSegments({ ...defaultSettings, sets: 2, rounds: 2 });
    expect(multi.map((s) => s.phase)).toEqual([
      'prepare',
      'work',
      'rest',
      'work',
      'setRest',
      'work',
      'rest',
      'work',
    ]);
  });

  it('omits prepare when 0', () => {
    expect(buildSegments({ ...defaultSettings, prepare: 0 })[0].phase).toBe(
      'work',
    );
  });
});

describe('computeProgress', () => {
  const segments = buildSegments(defaultSettings);

  it('walks through phases by elapsed time', () => {
    expect(computeProgress(segments, 0).phase).toBe('prepare');
    expect(computeProgress(segments, 10000)).toMatchObject({
      phase: 'work',
      round: 1,
      remaining: 20000,
    });
    expect(computeProgress(segments, 30000)).toMatchObject({
      phase: 'rest',
      round: 1,
      remaining: 10000,
    });
    expect(computeProgress(segments, 40000)).toMatchObject({
      phase: 'work',
      round: 2,
    });
  });

  it('is done at the total duration', () => {
    const p = computeProgress(segments, totalDuration(segments));
    expect(p.phase).toBe('done');
    expect(p.totalRemaining).toBe(0);
  });
});

test('formatTime rounds up', () => {
  expect(formatTime(20000)).toBe('00:20');
  expect(formatTime(19001)).toBe('00:20');
  expect(formatTime(0)).toBe('00:00');
});

test('formatTime shows hours from one hour', () => {
  expect(formatTime(3599000)).toBe('59:59');
  expect(formatTime(3600000)).toBe('1:00:00');
  expect(formatTime(6900000)).toBe('1:55:00');
});
