/**
 * Keeps the page "playing audio" so phones are less likely to freeze it when
 * the screen locks or the app goes to the background. A silent looping
 * <audio> element plus Media Session (lock-screen controls).
 */

let enabled = false;
let audio: HTMLAudioElement | null = null;

/** One second of 8-bit mono silence as a WAV data URL. */
const silentWav = (): string => {
  const rate = 8000;
  const bytes = new Uint8Array(44 + rate);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) =>
    Array.from(s).forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + rate, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, rate, true);
  bytes.fill(128, 44);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });

  return `data:audio/wav;base64,${window.btoa(bin)}`;
};

/** Call from a user gesture (e.g. the start button). */
export const startKeepAlive = (): void => {
  if (!enabled) return;
  try {
    if (!audio) {
      audio = new Audio(silentWav());
      audio.loop = true;
    }
    void audio.play().catch(() => undefined);
  } catch {
    audio = null;
  }
};

export const stopKeepAlive = (): void => {
  audio?.pause();
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.setActionHandler('pause', null);
    }
  } catch {
    // ignore
  }
};

export const setBackgroundEnabled = (on: boolean): void => {
  enabled = on;
  if (!on) stopKeepAlive();
};

/** Shows the running timer on the lock screen; "pause" there pauses timers. */
export const showMediaSession = (title: string, onPause: () => void): void => {
  if (!enabled || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'Loopy Timer',
    });
    navigator.mediaSession.playbackState = 'playing';
    navigator.mediaSession.setActionHandler('pause', onPause);
  } catch {
    // ignore
  }
};
