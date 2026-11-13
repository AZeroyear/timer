import { FC } from 'react';
import { LEVELS, Prefs } from 'features/prefs';
import { previewSound } from 'features/sound';
import { setBackgroundEnabled, startKeepAlive } from 'features/background';
import { wakeLockSupported } from 'containers/useWakeLock';
import { useI18n } from 'i18n';

type Props = {
  prefs: Prefs;
  onChange: (patch: Partial<Prefs>) => void;
  onClose: () => void;
};

const SettingsDialog: FC<Props> = ({ prefs, onChange, onClose }) => {
  const { t } = useI18n();

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
      >
        <h2 className="dialog-title">{t('settings.title')}</h2>

        <div role="radiogroup" aria-label={t('settings.sound')}>
          <p className="settings-label">{t('settings.sound')}</p>
          <div className="level-picker">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={prefs.level === level}
                className="level-option"
                onClick={() => {
                  onChange({ level });
                  // The level is applied by an effect; preview right after.
                  window.setTimeout(previewSound, 0);
                }}
              >
                <span className="level-bars" aria-hidden>
                  {LEVELS.map((n) => (
                    <i key={n} className={n <= level ? 'on' : ''} />
                  ))}
                </span>
                {t(`settings.level.${level}`)}
              </button>
            ))}
          </div>
          <p className="settings-hint">{t('settings.soundHint')}</p>
        </div>

        {wakeLockSupported() && (
          <div className="settings-switch">
            <span>
              <label className="settings-switch-title" htmlFor="keep-awake">
                {t('settings.keepAwake')}
              </label>
              <span className="settings-hint" id="keep-awake-hint">
                {t('settings.keepAwakeHint')}
              </span>
            </span>
            <input
              id="keep-awake"
              className="switch-input"
              type="checkbox"
              role="switch"
              aria-describedby="keep-awake-hint"
              checked={prefs.keepAwake}
              onChange={(e) => onChange({ keepAwake: e.target.checked })}
            />
          </div>
        )}

        <div className="settings-switch">
          <span>
            <label className="settings-switch-title" htmlFor="background-sound">
              {t('settings.background')}
            </label>
            <span className="settings-hint" id="background-sound-hint">
              {t('settings.backgroundHint')}
            </span>
          </span>
          <input
            id="background-sound"
            className="switch-input"
            type="checkbox"
            role="switch"
            aria-describedby="background-sound-hint"
            checked={prefs.background}
            onChange={(e) => {
              // Inside the user gesture, so phones allow the silent audio.
              setBackgroundEnabled(e.target.checked);
              if (e.target.checked) startKeepAlive();
              onChange({ background: e.target.checked });
            }}
          />
        </div>

        <button type="button" className="dialog-cancel" onClick={onClose}>
          {t('dialog.close')}
        </button>
      </div>
    </div>
  );
};

export default SettingsDialog;
