import { createTimer, displayName, parseTimers } from './timers';
import { findPreset } from './presets';
import { translate } from '../i18n';

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

describe('timer names follow the language until renamed', () => {
  const en = (k: Parameters<typeof translate>[1]) => translate('en', k);
  const ja = (k: Parameters<typeof translate>[1]) => translate('ja', k);

  it('untouched timers are translated', () => {
    const timer = createTimer(findPreset('pomodoro'));
    expect(displayName(timer, en)).toBe('Pomodoro');
    expect(displayName(timer, ja)).toBe('ポモドーロ');
  });

  it('renamed timers keep their name', () => {
    const timer = {
      ...createTimer(findPreset('pomodoro')),
      name: 'Study',
      renamed: true,
    };
    expect(displayName(timer, ja)).toBe('Study');
  });

  it('migrates timers saved before names were translated', () => {
    const [saved, custom] =
      parseTimers(
        JSON.stringify({
          timers: [
            { name: 'ポモドーロ', presetName: 'ポモドーロ' },
            { name: 'Mine', presetName: 'Tabata' },
          ],
        }),
      ) ?? [];
    expect(saved.presetId).toBe('pomodoro');
    expect(displayName(saved, en)).toBe('Pomodoro');
    expect(custom.presetId).toBe('tabata');
    expect(displayName(custom, en)).toBe('Mine');
  });
});
