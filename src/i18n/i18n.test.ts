import { langFromPath, translate } from 'i18n';
import { LANGS, messages } from 'i18n/messages';

const strip = (k: string) => k.replace(/\.(one|other|few|many|zero|two)$/, '');

test('every language has every message, with the same placeholders', () => {
  const english = messages.en;
  const baseKeys = new Set(Object.keys(english).map(strip));
  LANGS.forEach(({ code }) => {
    const table = messages[code];
    expect(new Set(Object.keys(table).map(strip))).toEqual(baseKeys);
    Object.entries(table).forEach(([key, value]) => {
      const ref = english[key] ?? english[`${strip(key)}.other`];
      const placeholders = (s: string) =>
        (s.match(/\{\w+\}/g) ?? []).sort().join(',');
      expect([code, key, placeholders(value)]).toEqual([
        code,
        key,
        placeholders(ref),
      ]);
    });
  });
});

test('plural forms follow each language', () => {
  expect(translate('en', 'unit.round', { n: 1 })).toBe('1 round');
  expect(translate('en', 'unit.round', { n: 8 })).toBe('8 rounds');
  expect(translate('ru', 'unit.round', { n: 1 })).toBe('1 раунд');
  expect(translate('ru', 'unit.round', { n: 3 })).toBe('3 раунда');
  expect(translate('ru', 'unit.round', { n: 8 })).toBe('8 раундов');
  expect(translate('ja', 'unit.round', { n: 8 })).toBe('8ラウンド');
});

test('langFromPath', () => {
  expect(langFromPath('/ja/')).toBe('ja');
  expect(langFromPath('/zh-TW/')).toBe('zh-tw');
  expect(langFromPath('/')).toBeNull();
  expect(langFromPath('/xx/')).toBeNull();
});
