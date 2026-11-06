import { defaultSettings, Settings } from 'features/tabata';
import landing from './landing.json';

export const PRESET_IDS = [
  'pomodoro',
  'tabata',
  'beginner',
  'hiit',
  'emom',
] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type Preset = {
  id: PresetId;
  emoji: string;
  name: string;
  settings: Settings;
};

export const presets: Preset[] = [
  {
    id: 'pomodoro',
    emoji: '🍅',
    name: 'Pomodoro',
    settings: {
      prepare: 0,
      work: 1500,
      rest: 300,
      rounds: 4,
      sets: 1,
      setRest: 0,
    },
  },
  {
    id: 'tabata',
    emoji: '🔥',
    name: 'Tabata',
    settings: defaultSettings,
  },
  {
    id: 'beginner',
    emoji: '🌱',
    name: 'Beginner',
    settings: { ...defaultSettings, rest: 20, rounds: 6 },
  },
  {
    id: 'hiit',
    emoji: '⚡',
    name: 'HIIT',
    settings: {
      prepare: 10,
      work: 40,
      rest: 20,
      rounds: 10,
      sets: 2,
      setRest: 60,
    },
  },
  {
    id: 'emom',
    emoji: '⏱️',
    name: 'EMOM 10',
    settings: { ...defaultSettings, work: 45, rest: 15, rounds: 10 },
  },
];

export const findPreset = (id: PresetId): Preset =>
  presets.find((p) => p.id === id) ?? presets[0];

export const EMOJIS = [
  '🍅',
  '🔥',
  '🌱',
  '⚡',
  '⏱️',
  '💪',
  '🧘',
  '📚',
  '🍳',
  '🏃',
  '🚴',
  '☕',
];

export type LandingId = 'pomodoro' | 'tabata' | 'hiit' | 'emom';
export type Landing = { id: LandingId; slug: string; emoji: string };

/** Presets that get their own page, e.g. /ja/tabata-timer/ (see scripts/prerender.js). */
export const LANDING = landing as Landing[];

/** `/ja/tabata-timer/` -> the Tabata landing entry. */
export const landingFromPath = (pathname: string): Landing | null => {
  const slug = pathname.split('/')[2];

  return LANDING.find((l) => l.slug === slug) ?? null;
};
