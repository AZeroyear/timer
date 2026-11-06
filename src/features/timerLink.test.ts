import { defaultSettings } from './tabata';
import { decodeTimerLink, timerLinkQuery, timerLinkUrl } from './timerLink';

const shared = {
  emoji: '🔥',
  name: 'Morning HIIT',
  settings: { ...defaultSettings, work: 40, rest: 20, rounds: 10, sets: 2 },
};

test('a timer survives a round trip through a link', () => {
  const url = timerLinkUrl('ja', shared);
  expect(url.startsWith('https://timer.eastazy.com/ja/?')).toBe(true);
  expect(decodeTimerLink(url.slice(url.indexOf('?')))).toEqual(shared);
});

test('invalid or hostile links are rejected or clamped', () => {
  expect(decodeTimerLink('')).toBeNull();
  expect(decodeTimerLink('?c=1,2,3')).toBeNull();
  expect(decodeTimerLink('?c=a,b,c,d,e,f')).toBeNull();
  const clamped = decodeTimerLink('?c=0,999999,0,500,500,0&n=%3Cb%3E');
  expect(clamped?.settings.work).toBe(3600);
  expect(clamped?.settings.rounds).toBe(99);
  expect(clamped?.name).toBe('<b>'); // plain text; React escapes it when rendered
});

test('long names are cut', () => {
  const query = timerLinkQuery({ ...shared, name: 'x'.repeat(100) });
  expect(decodeTimerLink(`?${query}`)?.name).toHaveLength(30);
});
