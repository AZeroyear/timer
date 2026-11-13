import { useCallback, useEffect, useState } from 'react';
import { loadPrefs, Prefs, savePrefs } from 'features/prefs';
import { setSoundLevel } from 'features/sound';

const usePrefs = () => {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    setSoundLevel(prefs.level);
    savePrefs(prefs);
  }, [prefs]);

  const update = useCallback(
    (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch })),
    [],
  );

  return { prefs, update };
};

export default usePrefs;
