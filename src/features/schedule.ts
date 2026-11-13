import { buildSegments, Settings } from 'features/tabata';

export type SoundName = 'countdown' | 'rest' | 'work' | 'done';

/** Higher index wins when several timers want a sound at the same moment. */
export const SOUND_PRIORITY: SoundName[] = [
  'countdown',
  'rest',
  'work',
  'done',
];

export type Upcoming = {
  /** ms from the given elapsed time (>= 0). */
  at: number;
  sound: SoundName;
  /** Stable id of this event within the timer, to avoid scheduling it twice. */
  key: string;
};

/**
 * Sounds that will play within `windowMs` after `elapsed`: the phase change
 * beep at the start of each work / rest segment, the 3-2-1 countdown before
 * every non-work segment ends, and the completion jingle at the very end.
 * Events already in the past are not returned.
 */
export const upcomingSounds = (
  settings: Settings,
  elapsed: number,
  windowMs: number,
): Upcoming[] => {
  const events: Upcoming[] = [];
  const segments = buildSegments(settings);
  let start = 0;
  segments.forEach((seg, i) => {
    const end = start + seg.duration;
    if (end >= elapsed && start <= elapsed + windowMs) {
      if (seg.phase === 'work') {
        events.push({ at: start, sound: 'work', key: `s${i}` });
      } else {
        if (seg.phase !== 'prepare') {
          events.push({ at: start, sound: 'rest', key: `s${i}` });
        }
        [3, 2, 1].forEach((sec) => {
          const t = end - sec * 1000;
          if (t >= start) {
            events.push({ at: t, sound: 'countdown', key: `c${i}-${sec}` });
          }
        });
      }
    }
    start = end;
  });
  if (segments.length > 0) {
    events.push({ at: start, sound: 'done', key: 'done' });
  }

  return events
    .map((e) => ({ ...e, at: e.at - elapsed }))
    .filter((e) => e.at >= 0 && e.at <= windowMs);
};
