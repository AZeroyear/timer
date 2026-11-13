import { defaultSettings, Settings } from 'features/tabata';
import { upcomingSounds } from './schedule';

const s: Settings = {
  ...defaultSettings,
  prepare: 0,
  work: 10,
  rest: 5,
  rounds: 2,
  sets: 1,
  setRest: 0,
};

describe('upcomingSounds', () => {
  it('announces the first phase at a fresh start', () => {
    expect(upcomingSounds(s, 0, 1500)).toEqual([
      { at: 0, sound: 'work', key: 's0' },
    ]);
  });

  it('counts down 3-2-1 before a rest ends and starts work after', () => {
    // work 0-10s, rest 10-15s, work 15-25s
    const e = upcomingSounds(s, 11000, 5000);
    expect(e.map((x) => [x.at, x.sound])).toEqual([
      [1000, 'countdown'],
      [2000, 'countdown'],
      [3000, 'countdown'],
      [4000, 'work'],
    ]);
  });

  it('ends with the done sound and skips past events', () => {
    expect(upcomingSounds(s, 24000, 3000)).toEqual([
      { at: 1000, sound: 'done', key: 'done' },
    ]);
    expect(upcomingSounds(s, 26000, 3000)).toEqual([]);
  });

  it('does not play the rest beep in the prepare phase', () => {
    const e = upcomingSounds({ ...s, prepare: 5 }, 0, 1000);
    expect(e).toEqual([]);
  });
});
