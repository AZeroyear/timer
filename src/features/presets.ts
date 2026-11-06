import { defaultSettings, Settings } from 'features/tabata';

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
