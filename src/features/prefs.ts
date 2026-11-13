export type SoundLevel = 1 | 2 | 3;

export type Prefs = {
  /** 1 = soft, 2 = clear, 3 = loud (+ vibration where supported). */
  level: SoundLevel;
  /** Keep the screen awake while a timer is running. */
  keepAwake: boolean;
  /** Play silent audio so sounds keep working when the screen locks. */
  background: boolean;
};

export const PREFS_KEY = 'loopy-timer:prefs';

export const DEFAULT_PREFS: Prefs = {
  level: 2,
  keepAwake: false,
  background: false,
};

export const LEVELS: SoundLevel[] = [1, 2, 3];

export const sanitizePrefs = (raw: unknown): Prefs => {
  const value = (raw ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  const level = LEVELS.find((l) => l === value.level);

  return {
    level: level ?? DEFAULT_PREFS.level,
    keepAwake:
      typeof value.keepAwake === 'boolean'
        ? value.keepAwake
        : DEFAULT_PREFS.keepAwake,
    background:
      typeof value.background === 'boolean'
        ? value.background
        : DEFAULT_PREFS.background,
  };
};

export const loadPrefs = (): Prefs => {
  try {
    const text = window.localStorage.getItem(PREFS_KEY);

    return sanitizePrefs(text ? JSON.parse(text) : null);
  } catch {
    return DEFAULT_PREFS;
  }
};

export const savePrefs = (prefs: Prefs): void => {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
};
