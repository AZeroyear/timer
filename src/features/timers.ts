import {
  buildSegments,
  clampSetting,
  defaultSettings,
  initialRun,
  RunState,
  Settings,
  totalDuration,
} from 'features/tabata';
import { findPreset, Preset } from 'features/presets';
import { Translate } from 'i18n';

export type TimerItem = {
  id: string;
  emoji: string;
  name: string;
  presetName: string;
  settings: Settings;
  run: RunState;
};

export const STORAGE_KEY = 'loopy-timer:v1';
export const MUTE_KEY = 'loopy-timer:muted';

let counter = 0;
const newId = (): string => {
  counter += 1;

  return `${Date.now().toString(36)}-${counter}`;
};

export const createTimer = (preset: Preset, name: string): TimerItem => ({
  id: newId(),
  emoji: preset.emoji,
  name,
  presetName: name,
  settings: preset.settings,
  run: initialRun,
});

export const defaultTimers = (t: Translate): TimerItem[] => {
  const preset = findPreset('pomodoro');

  return [createTimer(preset, t(`preset.${preset.id}`))];
};

/** Elapsed ms. Derived from timestamps, so intervals never drift. */
export const elapsedOf = (t: TimerItem, now: number): number =>
  t.run.accumulated + (t.run.running ? Math.max(0, now - t.run.startedAt) : 0);

export const totalOf = (t: TimerItem): number =>
  totalDuration(buildSegments(t.settings));

export const isIdle = (t: TimerItem): boolean =>
  !t.run.running && t.run.accumulated === 0;

export const isFinished = (t: TimerItem, now: number): boolean =>
  elapsedOf(t, now) >= totalOf(t);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const str = (v: unknown, fallback: string, max: number): string =>
  typeof v === 'string' && v.trim() ? v.slice(0, max) : fallback;

const parseTimer = (raw: unknown): TimerItem | null => {
  if (!isRecord(raw)) return null;
  const rawSettings = isRecord(raw.settings) ? raw.settings : {};
  const settings = { ...defaultSettings };
  (Object.keys(defaultSettings) as (keyof Settings)[]).forEach((key) => {
    settings[key] = clampSetting(key, num(rawSettings[key], settings[key]));
  });
  const rawRun = isRecord(raw.run) ? raw.run : {};
  const startedAt = num(rawRun.startedAt, 0);
  const running = rawRun.running === true && startedAt > 0;

  return {
    id: str(raw.id, newId(), 40),
    emoji: str(raw.emoji, '⏱️', 8),
    name: str(raw.name, 'Timer', 30),
    presetName: str(raw.presetName, 'Custom', 30),
    settings,
    run: {
      running,
      startedAt: running ? startedAt : 0,
      accumulated: Math.max(0, num(rawRun.accumulated, 0)),
    },
  };
};

/** Returns null when nothing valid was saved. */
export const parseTimers = (json: string | null): TimerItem[] | null => {
  if (!json) return null;
  try {
    const data: unknown = JSON.parse(json);
    if (!isRecord(data) || !Array.isArray(data.timers)) return null;

    return data.timers
      .map(parseTimer)
      .filter((t): t is TimerItem => t !== null);
  } catch {
    return null;
  }
};

// localStorage can throw (private mode, blocked storage); the app still works.
export const loadTimers = (): TimerItem[] | null => {
  try {
    return parseTimers(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const saveTimers = (timers: TimerItem[]): void => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, timers }),
    );
  } catch {
    // ignore
  }
};

export const loadMuted = (): boolean => {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export const saveMuted = (muted: boolean): void => {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
};
