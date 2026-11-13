import { DEFAULT_PREFS, loadPrefs, sanitizePrefs, savePrefs } from './prefs';

describe('prefs', () => {
  beforeEach(() => window.localStorage.clear());

  it('falls back to defaults for missing or broken data', () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs({ level: 9, keepAwake: 'yes' })).toEqual(
      DEFAULT_PREFS,
    );
    window.localStorage.setItem('loopy-timer:prefs', '{oops');
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('round-trips valid values', () => {
    savePrefs({ level: 3, keepAwake: true, background: true });
    expect(loadPrefs()).toEqual({
      level: 3,
      keepAwake: true,
      background: true,
    });
  });
});
