import { useEffect } from 'react';

// Minimal typings: the TypeScript version in use has no Wake Lock API types.
type Sentinel = { released: boolean; release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock: { request: (type: 'screen') => Promise<Sentinel> };
};

export const wakeLockSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/** Keeps the screen on while `active` is true (re-acquired after the tab returns to the foreground). */
const useWakeLock = (active: boolean): void => {
  useEffect(() => {
    if (!active || !wakeLockSupported()) return undefined;
    let sentinel: Sentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (sentinel && !sentinel.released) return;
      try {
        const lock = await (navigator as WakeLockNavigator).wakeLock.request(
          'screen',
        );
        if (cancelled) void lock.release();
        else sentinel = lock;
      } catch {
        // Denied (e.g. low battery); the timer still works.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };

    void request();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [active]);
};

export default useWakeLock;
