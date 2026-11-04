import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useCookies } from 'react-cookie';
import {
  buildSegments,
  clampSetting,
  completedState,
  computeProgress,
  defaultSettings,
  formatTime,
  initialRun,
  runState,
  Settings,
  settingsState,
  totalDuration,
} from 'features/tabata';
import {
  initAudio,
  soundCountdown,
  soundDone,
  soundRest,
  soundWork,
} from 'features/sound';

import TabataBoard from 'components/organisms/TabataBoard';
import Tweet from 'components/molecules/Tweet';
import Coffee from 'components/molecules/Coffee';
import Join from 'components/molecules/Join';

const COOKIE_KEY = 'tabata';
const TITLE = 'Tabata Timer';
const TICK_MS = 100;

const parseSettings = (raw: unknown): Settings => {
  const saved = (raw && typeof raw === 'object' ? raw : {}) as Partial<
    Record<keyof Settings, unknown>
  >;
  const next = { ...defaultSettings };
  (Object.keys(defaultSettings) as (keyof Settings)[]).forEach((key) => {
    const value = Number(saved[key]);
    if (saved[key] !== undefined && !Number.isNaN(value)) {
      next[key] = clampSetting(key, value);
    }
  });

  return next;
};

const TabataTimer: FC = () => {
  const [settings, setSettings] = useRecoilState(settingsState);
  const [run, setRun] = useRecoilState(runState);
  const [completed, setCompleted] = useRecoilState(completedState);
  const [cookies, setCookie] = useCookies([COOKIE_KEY]);
  const [now, setNow] = useState(() => Date.now());

  const segments = useMemo(() => buildSegments(settings), [settings]);
  const total = useMemo(() => totalDuration(segments), [segments]);

  const elapsed = run.accumulated + (run.running ? now - run.startedAt : 0);
  const progress = computeProgress(segments, elapsed);
  const idle = !run.running && run.accumulated === 0;

  // Restore saved settings once.
  useEffect(() => {
    if (cookies[COOKIE_KEY]) setSettings(parseSettings(cookies[COOKIE_KEY]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick while running. Time is derived from timestamps, so drift never accumulates.
  useEffect(() => {
    if (!run.running) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);

    return () => clearInterval(id);
  }, [run.running]);

  // Phase change sounds (not fired on pause/resume since the index is unchanged).
  const lastIndex = useRef(-1);
  useEffect(() => {
    if (!run.running) return;
    if (progress.index === lastIndex.current) return;
    lastIndex.current = progress.index;
    if (progress.phase === 'work') soundWork();
    if (progress.phase === 'rest' || progress.phase === 'setRest') soundRest();
  }, [run.running, progress.index, progress.phase]);

  // Countdown beeps during the last 3 seconds of non-work phases.
  const countdownSec = Math.ceil(progress.remaining / 1000);
  const lastCountdown = useRef(0);
  useEffect(() => {
    if (
      !run.running ||
      progress.phase === 'work' ||
      progress.phase === 'done'
    ) {
      return;
    }
    if (countdownSec >= 1 && countdownSec <= 3) {
      if (lastCountdown.current !== countdownSec) soundCountdown();
      lastCountdown.current = countdownSec;
    } else {
      lastCountdown.current = 0;
    }
  }, [run.running, progress.phase, countdownSec]);

  // Finish.
  useEffect(() => {
    if (run.running && progress.phase === 'done') {
      soundDone();
      setRun({ running: false, startedAt: 0, accumulated: total });
      setCompleted((c) => ({
        count: c.count + 1,
        workTime:
          c.workTime + settings.work * 1000 * settings.rounds * settings.sets,
      }));
    }
  }, [run.running, progress.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab title / favicon.
  useEffect(() => {
    const fav = document.getElementById('fa') as HTMLLinkElement | null;
    const active = run.running && progress.phase !== 'done';
    document.title = active
      ? `${formatTime(progress.remaining)} ${
          progress.phase === 'work' ? 'WORK' : 'REST'
        }`
      : TITLE;
    if (fav) {
      const icon =
        active && progress.phase !== 'work'
          ? 'favicon_break.ico'
          : 'favicon.ico';
      fav.href = `${process.env.PUBLIC_URL}/${icon}`;
    }
  }, [run.running, progress.phase, progress.remaining]);

  const start = useCallback(() => {
    initAudio();
    const finished = run.accumulated >= total && total > 0;
    lastIndex.current = finished ? -1 : lastIndex.current;
    lastCountdown.current = 0;
    setRun({
      running: true,
      startedAt: Date.now(),
      accumulated: finished ? 0 : run.accumulated,
    });
  }, [run.accumulated, total, setRun]);

  const pause = useCallback(() => {
    setRun({
      running: false,
      startedAt: 0,
      accumulated: run.accumulated + Date.now() - run.startedAt,
    });
  }, [run, setRun]);

  const reset = useCallback(() => {
    lastIndex.current = -1;
    lastCountdown.current = 0;
    setRun(initialRun);
  }, [setRun]);

  const changeSettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      setCookie(COOKIE_KEY, next, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    },
    [setSettings, setCookie],
  );

  return (
    <>
      <TabataBoard
        {...{ settings, progress, idle, total, elapsed }}
        running={run.running}
        finished={progress.phase === 'done'}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onChange={changeSettings}
      />
      <Tweet total={completed} />
      <div className="flex-center">
        <Coffee />
        <Join />
      </div>
    </>
  );
};

export default TabataTimer;
