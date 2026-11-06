import { translate } from 'i18n';
import { defaultSettings } from './tabata';
import {
  buildShareText,
  cycleLabel,
  intervalLabel,
  secondsLabel,
  tweetUrl,
} from './share';

const en = (key: Parameters<typeof translate>[1], params = {}) =>
  translate('en', key, params);
const ja = (key: Parameters<typeof translate>[1], params = {}) =>
  translate('ja', key, params);

const item = { emoji: '🔥', name: 'Tabata', settings: defaultSettings };

test('cycleLabel counts rounds and sets', () => {
  expect(cycleLabel({ ...defaultSettings, rounds: 1, sets: 1 }, en)).toBe(
    '1 round',
  );
  expect(cycleLabel({ ...defaultSettings, rounds: 8, sets: 1 }, en)).toBe(
    '8 rounds',
  );
  expect(cycleLabel({ ...defaultSettings, rounds: 10, sets: 2 }, en)).toBe(
    '2 sets × 10 rounds',
  );
  expect(cycleLabel({ ...defaultSettings, rounds: 10, sets: 2 }, ja)).toBe(
    '2セット × 10ラウンド',
  );
});

test('share text says what was done and how many cycles', () => {
  const text = buildShareText(item, en);
  expect(text).toContain('🔥 Tabata done!');
  expect(text).toContain('8 rounds');
  expect(text).toContain('20s work / 10s rest');
  expect(text).toContain('#LoopyTimer');
});

test('share text in Japanese', () => {
  const text = buildShareText(item, ja);
  expect(text).toContain('🔥 Tabata を完了！');
  expect(text).toContain('8ラウンド');
  expect(text).toContain('ワーク20秒 / 休憩10秒');
});

test('tweetUrl encodes text and url', () => {
  const url = tweetUrl('a b\n#x', 'https://example.com/');
  expect(url).toContain('text=a%20b%0A%23x');
  expect(url).toContain('url=https%3A%2F%2Fexample.com%2F');
});

test('secondsLabel', () => {
  expect(secondsLabel(20, en)).toBe('20s');
  expect(secondsLabel(1500, en)).toBe('25 min');
  expect(secondsLabel(90, en)).toBe('1m30s');
  expect(secondsLabel(90, ja)).toBe('1分30秒');
  expect(intervalLabel({ ...defaultSettings, work: 1500, rest: 0 }, ja)).toBe(
    'ワーク25分',
  );
});
