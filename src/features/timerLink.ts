import { APP_URL } from 'features/share';
import { clampSetting, defaultSettings, Settings } from 'features/tabata';
import type { Lang } from 'i18n';

export type SharedTimer = { emoji: string; name: string; settings: Settings };

// n = name, e = emoji, c = prepare,work,rest,rounds,sets,setRest
const KEYS: (keyof Settings)[] = [
  'prepare',
  'work',
  'rest',
  'rounds',
  'sets',
  'setRest',
];

export const timerLinkQuery = ({ emoji, name, settings }: SharedTimer) =>
  new URLSearchParams({
    n: name,
    e: emoji,
    c: KEYS.map((key) => settings[key]).join(','),
  }).toString();

export const timerLinkUrl = (lang: Lang, timer: SharedTimer): string =>
  `${APP_URL}${lang}/?${timerLinkQuery(timer)}`;

/** Reads a shared timer from a URL query. Returns null unless it is valid. */
export const decodeTimerLink = (search: string): SharedTimer | null => {
  const params = new URLSearchParams(search);
  const parts = (params.get('c') ?? '').split(',');
  if (parts.length !== KEYS.length) return null;
  const numbers = parts.map((p) => (p.trim() === '' ? NaN : Number(p)));
  if (numbers.some((n) => !Number.isFinite(n))) return null;

  const settings = { ...defaultSettings };
  KEYS.forEach((key, i) => {
    settings[key] = clampSetting(key, numbers[i]);
  });

  return {
    emoji: (params.get('e') ?? '').trim().slice(0, 8) || '⏱️',
    name: (params.get('n') ?? '').trim().slice(0, 30) || 'Timer',
    settings,
  };
};

/** Drops the share parameters from the address bar once they are handled. */
export const clearTimerLinkFromUrl = (): void => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('c')) return;
  ['n', 'e', 'c'].forEach((key) => params.delete(key));
  const query = params.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${
      window.location.hash
    }`,
  );
};
