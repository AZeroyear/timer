import { useEffect } from 'react';
import {
  setBackgroundEnabled,
  showMediaSession,
  startKeepAlive,
  stopKeepAlive,
} from 'features/background';

/**
 * While `title` is set (a timer is running) and the option is on, keep the
 * page alive in the background; otherwise let go of the audio session.
 */
const useBackground = (
  enabled: boolean,
  title: string | null,
  onPause: () => void,
): void => {
  useEffect(() => setBackgroundEnabled(enabled), [enabled]);

  useEffect(() => {
    if (!enabled || title === null) {
      stopKeepAlive();

      return;
    }
    startKeepAlive(); // may be refused without a gesture; start() also calls it
    showMediaSession(title, onPause);
  }, [enabled, title, onPause]);
};

export default useBackground;
