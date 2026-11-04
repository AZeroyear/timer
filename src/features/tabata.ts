import { atom } from 'recoil';

export type Phase = 'prepare' | 'work' | 'rest' | 'setRest' | 'done';

export type Settings = {
  prepare: number; // seconds
  work: number;
  rest: number;
  rounds: number;
  sets: number;
  setRest: number;
};

export const defaultSettings: Settings = {
  prepare: 10,
  work: 20,
  rest: 10,
  rounds: 8,
  sets: 1,
  setRest: 60,
};

export const settingLimits: Record<
  keyof Settings,
  { min: number; max: number }
> = {
  prepare: { min: 0, max: 600 },
  work: { min: 1, max: 3600 },
  rest: { min: 0, max: 3600 },
  rounds: { min: 1, max: 99 },
  sets: { min: 1, max: 99 },
  setRest: { min: 0, max: 3600 },
};

export type Segment = {
  phase: Exclude<Phase, 'done'>;
  duration: number; // ms
  round: number;
  set: number;
};

/** Run state. Elapsed time = accumulated + (now - startedAt) while running. */
export type RunState = {
  running: boolean;
  startedAt: number;
  accumulated: number; // ms
};

export const initialRun: RunState = {
  running: false,
  startedAt: 0,
  accumulated: 0,
};

export const settingsState = atom<Settings>({
  key: 'tabataSettings',
  default: defaultSettings,
});

export const runState = atom<RunState>({
  key: 'tabataRun',
  default: initialRun,
});

export const completedState = atom({
  key: 'tabataCompleted',
  default: { count: 0, workTime: 0 },
});

/**
 * prepare -> (work -> rest) x rounds -> setRest -> ... -> done.
 * The last rest of a set is skipped, as is the set rest after the last set.
 */
export const buildSegments = (s: Settings): Segment[] => {
  const segments: Segment[] = [];
  if (s.prepare > 0) {
    segments.push({
      phase: 'prepare',
      duration: s.prepare * 1000,
      round: 0,
      set: 1,
    });
  }
  for (let set = 1; set <= s.sets; set += 1) {
    for (let round = 1; round <= s.rounds; round += 1) {
      segments.push({ phase: 'work', duration: s.work * 1000, round, set });
      if (round < s.rounds && s.rest > 0) {
        segments.push({ phase: 'rest', duration: s.rest * 1000, round, set });
      }
    }
    if (set < s.sets && s.setRest > 0) {
      segments.push({
        phase: 'setRest',
        duration: s.setRest * 1000,
        round: s.rounds,
        set,
      });
    }
  }

  return segments;
};

export const totalDuration = (segments: Segment[]): number =>
  segments.reduce((sum, seg) => sum + seg.duration, 0);

export type Progress = {
  phase: Phase;
  index: number; // segment index (segments.length when done)
  round: number;
  set: number;
  remaining: number; // ms left in current segment
  totalRemaining: number; // ms left overall
};

export const computeProgress = (
  segments: Segment[],
  elapsed: number,
): Progress => {
  const total = totalDuration(segments);
  let passed = 0;
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (elapsed < passed + seg.duration) {
      return {
        phase: seg.phase,
        index: i,
        round: seg.round,
        set: seg.set,
        remaining: passed + seg.duration - elapsed,
        totalRemaining: total - elapsed,
      };
    }
    passed += seg.duration;
  }
  const last = segments[segments.length - 1];

  return {
    phase: 'done',
    index: segments.length,
    round: last ? last.round : 0,
    set: last ? last.set : 1,
    remaining: 0,
    totalRemaining: 0,
  };
};

/** Display as mm:ss, rounding up so that 0:00 appears only when finished. */
export const formatTime = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;

  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const clampSetting = (key: keyof Settings, value: number): number => {
  const { min, max } = settingLimits[key];
  if (Number.isNaN(value)) return min;

  return Math.min(max, Math.max(min, Math.floor(value)));
};
