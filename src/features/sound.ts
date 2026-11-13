import { SoundLevel } from 'features/prefs';
import { SoundName } from 'features/schedule';

let ctx: AudioContext | null = null;

/** Must be called from a user gesture (e.g. the start button). */
export const initAudio = (): void => {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
};

type LevelConfig = {
  type: OscillatorType;
  gain: number;
  repeat: number;
};

const CONFIGS: Record<SoundLevel, LevelConfig> = {
  1: { type: 'sine', gain: 0.4, repeat: 1 },
  2: { type: 'triangle', gain: 0.8, repeat: 2 },
  3: { type: 'square', gain: 0.7, repeat: 3 },
};

let level: SoundLevel = 2;

export const setSoundLevel = (next: SoundLevel): void => {
  level = next;
};

/** While set, every oscillator started by beep() is collected here. */
let recording: { stop: () => void }[] | null = null;

const beep = (freq: number, duration: number, delay = 0): void => {
  if (!ctx) return;
  const { type, gain: peak } = CONFIGS[level];
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
  recording?.push(osc);
};

/** Loud level also vibrates on phones that support it (mostly Android). */
const vibrate = (pattern: number[], delay = 0): void => {
  if (level !== 3) return;
  const run = () => {
    try {
      navigator.vibrate?.(pattern);
    } catch {
      // ignore
    }
  };
  if (delay > 0) {
    const id = window.setTimeout(run, delay * 1000);
    recording?.push({ stop: () => window.clearTimeout(id) });
  } else {
    run();
  }
};

/** A phase change beep, repeated more often at higher levels. */
const alert = (freq: number, duration: number, delay = 0): void => {
  const { repeat } = CONFIGS[level];
  const len = repeat > 1 ? Math.min(duration, 0.3) : duration;
  for (let i = 0; i < repeat; i += 1) beep(freq, len, delay + i * (len + 0.12));
  vibrate([300, 100, 300], delay);
};

export const soundWork = (delay = 0): void => alert(1200, 0.6, delay);
export const soundRest = (delay = 0): void => alert(520, 0.5, delay);
export const soundCountdown = (delay = 0): void => beep(880, 0.12, delay);
export const soundDone = (delay = 0): void => {
  const { repeat } = CONFIGS[level];
  for (let i = 0; i < repeat; i += 1) {
    const base = delay + i * 1.4;
    beep(660, 0.2, base);
    beep(880, 0.2, base + 0.25);
    beep(1320, 0.5, base + 0.5);
  }
  vibrate([400, 150, 400, 150, 600], delay);
};

/** Plays the work sound at the current level (used when picking a level). */
export const previewSound = (): void => {
  initAudio();
  soundWork();
};

const PLAYERS: Record<SoundName, (delay: number) => void> = {
  countdown: soundCountdown,
  rest: soundRest,
  work: soundWork,
  done: soundDone,
};

/**
 * Queues a sound on the audio clock `delayMs` from now, so it stays accurate
 * even when the page's timers are throttled in the background. Returns a
 * function that cancels it (pause / reset / mute before it plays).
 */
export const scheduleSound = (
  name: SoundName,
  delayMs: number,
): (() => void) => {
  const nodes: { stop: () => void }[] = [];
  recording = nodes;
  PLAYERS[name](Math.max(0, delayMs) / 1000);
  recording = null;

  return () =>
    nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    });
};
