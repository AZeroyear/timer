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

const beep = (freq: number, duration: number, delay = 0): void => {
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
};

export const soundWork = (): void => beep(1200, 0.6);
export const soundRest = (): void => beep(520, 0.5);
export const soundCountdown = (): void => beep(880, 0.12);
export const soundDone = (): void => {
  beep(660, 0.2);
  beep(880, 0.2, 0.25);
  beep(1320, 0.5, 0.5);
};
