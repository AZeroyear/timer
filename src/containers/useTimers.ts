import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildSegments,
  computeProgress,
  formatTime,
  initialRun,
  totalDuration,
} from 'features/tabata';
import { initAudio, scheduleSound } from 'features/sound';
import { SOUND_PRIORITY, SoundName, upcomingSounds } from 'features/schedule';
import { startKeepAlive } from 'features/background';
import {
  createTimer,
  createTimerFromShared,
  displayName,
  elapsedOf,
  loadMuted,
  loadTimers,
  saveMuted,
  saveTimers,
  TimerItem,
} from 'features/timers';
import { findPreset, landingFromPath, Preset } from 'features/presets';
import {
  clearTimerLinkFromUrl,
  decodeTimerLink,
  SharedTimer,
} from 'features/timerLink';
import { recordSession } from 'features/stats';
import { useI18n } from 'i18n';

const TICK_MS = 100;

/** How far ahead sounds are queued on the audio clock. */
const LOOKAHEAD_MS = 1500;

type Pending = { key: string; atAbs: number; cancel: () => void };
type Wanted = { sound: SoundName; atMs: number; marks: Pending[] };

/** A timer offered to the visitor (shared link, or a preset landing page). */
export type Incoming =
  | { kind: 'link'; timer: SharedTimer }
  | { kind: 'preset'; preset: Preset };

type Initial = { timers: TimerItem[]; incoming: Incoming | null };

/**
 * First visit: start with the shared timer / the landing page's preset /
 * Pomodoro. Returning visitors keep their timers and are *asked* before
 * anything is added.
 */
const computeInitial = (): Initial => {
  const saved = loadTimers();
  const link = decodeTimerLink(window.location.search);
  const landing = landingFromPath(window.location.pathname);
  const landingPreset = landing ? findPreset(landing.id) : null;

  if (!saved) {
    return {
      timers: [
        link
          ? createTimerFromShared(link)
          : createTimer(landingPreset ?? findPreset('pomodoro')),
      ],
      incoming: null,
    };
  }
  if (link) return { timers: saved, incoming: { kind: 'link', timer: link } };
  if (landingPreset && !saved.some((t) => t.presetId === landingPreset.id)) {
    return {
      timers: saved,
      incoming: { kind: 'preset', preset: landingPreset },
    };
  }

  return { timers: saved, incoming: null };
};

const useTimers = () => {
  const { t: tx } = useI18n();
  const [initial] = useState(computeInitial);
  const [timers, setTimers] = useState<TimerItem[]>(initial.timers);
  const [incoming, setIncoming] = useState<Incoming | null>(initial.incoming);
  const [muted, setMuted] = useState(loadMuted);
  const [now, setNow] = useState(() => Date.now());
  // Sounds already queued on the audio clock, per timer (so a pause can
  // cancel them and the same event is never queued twice).
  const pending = useRef(new Map<string, Pending[]>());

  useEffect(() => clearTimerLinkFromUrl(), []);
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

  // Phase sounds, countdown beeps and completion are queued slightly ahead on
  // the audio clock. At most one sound per moment, so several timers never
  // pile their beeps on top of each other.
  useEffect(() => {
    const queued = pending.current;
    const live = new Set(timers.filter((t) => t.run.running).map((t) => t.id));
    Array.from(queued.keys()).forEach((id) => {
      if (live.has(id) && !muted) return;
      queued.get(id)?.forEach((p) => p.cancel());
      queued.delete(id);
    });

    const finishedIds: string[] = [];
    const wanted = new Map<number, Wanted>();

    timers.forEach((t) => {
      if (!t.run.running) return;
      const elapsed = elapsedOf(t, now);
      if (
        computeProgress(buildSegments(t.settings), elapsed).phase === 'done'
      ) {
        finishedIds.push(t.id);
        // The completion sound is playing right now: do not cancel it.
        queued.delete(t.id);

        return;
      }
      if (muted) return;

      const list = (queued.get(t.id) ?? []).filter((p) => p.atAbs > now - 1000);
      queued.set(t.id, list);
      upcomingSounds(t.settings, elapsed, LOOKAHEAD_MS).forEach((e) => {
        if (list.some((p) => p.key === e.key)) return;
        const mark: Pending = {
          key: e.key,
          atAbs: now + e.at,
          cancel: () => undefined,
        };
        list.push(mark);
        const slot = Math.round((now + e.at) / 100);
        const current = wanted.get(slot);
        const stronger =
          !current ||
          SOUND_PRIORITY.indexOf(e.sound) >
            SOUND_PRIORITY.indexOf(current.sound);
        wanted.set(slot, {
          sound: stronger ? e.sound : current.sound,
          atMs: stronger ? e.at : current.atMs,
          marks: [...(current?.marks ?? []), mark],
        });
      });
    });

    wanted.forEach(({ sound, atMs, marks }) => {
      const cancel = scheduleSound(sound, atMs);
      marks.forEach((mark) => {
        // eslint-disable-next-line no-param-reassign
        mark.cancel = cancel;
      });
    });

    if (finishedIds.length > 0) {
      finishedIds.forEach(() => recordSession());
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
      const landing = landingFromPath(window.location.pathname);
      document.title = landing
        ? tx('seo.presetTitle', { name: tx(`preset.${landing.id}`) })
        : tx('seo.title');

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
      startKeepAlive();
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

  const add = useCallback((preset: Preset): string => {
    const timer = createTimer(preset);
    setTimers((list) => [...list, timer]);

    return timer.id;
  }, []);

  const edit = useCallback(
    (id: string, values: Pick<TimerItem, 'emoji' | 'name' | 'settings'>) =>
      update(id, (t) => ({
        ...t,
        ...values,
        renamed: t.renamed || values.name !== displayName(t, tx),
      })),
    [update, tx],
  );

  const acceptIncoming = useCallback(() => {
    if (!incoming) return;
    const timer =
      incoming.kind === 'link'
        ? createTimerFromShared(incoming.timer)
        : createTimer(incoming.preset);
    setTimers((list) => [...list, timer]);
    setIncoming(null);
  }, [incoming]);

  const dismissIncoming = useCallback(() => setIncoming(null), []);

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
    incoming,
    acceptIncoming,
    dismissIncoming,
  };
};

export default useTimers;
