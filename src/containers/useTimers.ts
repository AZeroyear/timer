import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildSegments,
  computeProgress,
  formatTime,
  initialRun,
  Phase,
  totalDuration,
} from 'features/tabata';
import {
  initAudio,
  soundCountdown,
  soundDone,
  soundRest,
  soundWork,
} from 'features/sound';
import {
  createTimer,
  defaultTimers,
  displayName,
  elapsedOf,
  isIdle,
  loadMuted,
  loadTimers,
  saveMuted,
  saveTimers,
  TimerItem,
} from 'features/timers';
import { Preset } from 'features/presets';
import { useI18n } from 'i18n';

const TICK_MS = 100;

type Tracker = { index: number; countdown: number };
type Sound = 'countdown' | 'rest' | 'work' | 'done';
const SOUND_PRIORITY: Sound[] = ['countdown', 'rest', 'work', 'done'];
const PLAY: Record<Sound, () => void> = {
  countdown: soundCountdown,
  rest: soundRest,
  work: soundWork,
  done: soundDone,
};

const phaseSound = (phase: Phase): Sound | null => {
  if (phase === 'work') return 'work';
  if (phase === 'rest' || phase === 'setRest') return 'rest';

  return null;
};

const useTimers = () => {
  const { t: tx } = useI18n();
  const [timers, setTimers] = useState<TimerItem[]>(
    () => loadTimers() ?? defaultTimers(),
  );
  const [muted, setMuted] = useState(loadMuted);
  const [now, setNow] = useState(() => Date.now());
  // Per-timer sound bookkeeping. A missing entry means "just restored": stay
  // silent for the phase that is already in progress.
  const trackers = useRef(new Map<string, Tracker>());
  const latest = useRef(timers);
  latest.current = timers;

  useEffect(() => saveTimers(timers), [timers]);
  useEffect(() => saveMuted(muted), [muted]);

  // One shared ticker for every running timer.
  const anyRunning = timers.some((t) => t.run.running);
  useEffect(() => {
    if (!anyRunning) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);

    return () => window.clearInterval(id);
  }, [anyRunning]);

  // Phase sounds, countdown beeps and completion. At most one sound per tick,
  // so several timers never pile their beeps on top of each other.
  useEffect(() => {
    let loudest = -1;
    const finishedIds: string[] = [];
    const wanted = (sound: Sound) => {
      loudest = Math.max(loudest, SOUND_PRIORITY.indexOf(sound));
    };

    timers.forEach((t) => {
      if (!t.run.running) {
        trackers.current.delete(t.id);

        return;
      }
      const segments = buildSegments(t.settings);
      const progress = computeProgress(segments, elapsedOf(t, now));
      const known = trackers.current.get(t.id);
      const track = known ?? { index: progress.index, countdown: 0 };
      trackers.current.set(t.id, track);

      if (progress.phase === 'done') {
        finishedIds.push(t.id);
        trackers.current.delete(t.id);
        wanted('done');

        return;
      }
      if (known && track.index !== progress.index) {
        const sound = phaseSound(progress.phase);
        if (sound) wanted(sound);
      }
      track.index = progress.index;

      const sec = Math.ceil(progress.remaining / 1000);
      if (progress.phase !== 'work' && sec >= 1 && sec <= 3) {
        if (track.countdown !== sec) wanted('countdown');
        track.countdown = sec;
      } else {
        track.countdown = 0;
      }
    });

    if (loudest >= 0 && !muted) PLAY[SOUND_PRIORITY[loudest]]();
    if (finishedIds.length > 0) {
      setTimers((list) =>
        list.map((t) =>
          finishedIds.includes(t.id)
            ? {
                ...t,
                run: {
                  running: false,
                  startedAt: 0,
                  accumulated: totalDuration(buildSegments(t.settings)),
                },
              }
            : t,
        ),
      );
    }
  }, [timers, now, muted]);

  // Tab title: the first running timer (plus how many others are running).
  useEffect(() => {
    const running = timers.filter((t) => t.run.running);
    if (running.length === 0) {
      document.title = tx('seo.title');

      return;
    }
    const [first] = running;
    const progress = computeProgress(
      buildSegments(first.settings),
      elapsedOf(first, now),
    );
    const more = running.length > 1 ? ` (+${running.length - 1})` : '';
    document.title = `${formatTime(progress.remaining)} ${
      first.emoji
    } ${displayName(first, tx)}${more}`;
  }, [timers, now, tx]);

  const update = useCallback(
    (id: string, fn: (t: TimerItem) => TimerItem) =>
      setTimers((list) => list.map((t) => (t.id === id ? fn(t) : t))),
    [],
  );

  const start = useCallback(
    (id: string) => {
      initAudio(); // needs a user gesture
      // A fresh start announces its first phase; a resume stays quiet.
      const target = latest.current.find((t) => t.id === id);
      if (target && isIdle(target)) {
        trackers.current.set(id, { index: -1, countdown: 0 });
      }
      update(id, (t) => ({
        ...t,
        run: { ...t.run, running: true, startedAt: Date.now() },
      }));
    },
    [update],
  );

  const pause = useCallback(
    (id: string) =>
      update(id, (t) => ({
        ...t,
        run: {
          running: false,
          startedAt: 0,
          accumulated: t.run.accumulated + Date.now() - t.run.startedAt,
        },
      })),
    [update],
  );

  const reset = useCallback(
    (id: string) => update(id, (t) => ({ ...t, run: initialRun })),
    [update],
  );

  const remove = useCallback(
    (id: string) => setTimers((list) => list.filter((t) => t.id !== id)),
    [],
  );

  const add = useCallback(
    (preset: Preset) => setTimers((list) => [...list, createTimer(preset)]),
    [],
  );

  const edit = useCallback(
    (id: string, values: Pick<TimerItem, 'emoji' | 'name' | 'settings'>) =>
      update(id, (t) => ({
        ...t,
        ...values,
        renamed: t.renamed || values.name !== displayName(t, tx),
      })),
    [update, tx],
  );

  const toggleMute = useCallback(() => {
    initAudio();
    setMuted((m) => !m);
  }, []);

  return {
    timers,
    now,
    muted,
    toggleMute,
    start,
    pause,
    reset,
    remove,
    add,
    edit,
  };
};

export default useTimers;
