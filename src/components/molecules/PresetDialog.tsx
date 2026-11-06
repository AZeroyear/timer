import { FC } from 'react';
import { formatTime, totalDuration, buildSegments } from 'features/tabata';
import { Preset, presets } from 'features/presets';
import { cycleLabel, intervalLabel } from 'features/share';
import { useI18n } from 'i18n';

type Props = {
  onSelect: (preset: Preset) => void;
  onClose: () => void;
};

const PresetDialog: FC<Props> = ({ onSelect, onClose }) => {
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
        aria-label={t('preset.title')}
      >
        <h2 className="dialog-title">{t('preset.title')}</h2>
        <ul className="preset-list">
          {presets.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onSelect(p)}>
                <span className="preset-name">{t(`preset.${p.id}`)}</span>
                <span className="preset-desc">
                  {cycleLabel(p.settings, t)} · {intervalLabel(p.settings, t)}
                </span>
                <span className="preset-total">
                  {formatTime(totalDuration(buildSegments(p.settings)))}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="dialog-cancel" onClick={onClose}>
          {t('dialog.cancel')}
        </button>
      </div>
    </div>
  );
};

export default PresetDialog;
