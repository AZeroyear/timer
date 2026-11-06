import { FC, useState } from 'react';
import { EMOJIS } from 'features/presets';
import { MessageKey, useI18n } from 'i18n';
import {
  buildSegments,
  clampSetting,
  formatTime,
  Settings,
  totalDuration,
} from 'features/tabata';

const FIELDS: { key: keyof Settings; label: MessageKey; unit: boolean }[] = [
  { key: 'prepare', label: 'edit.prepare', unit: true },
  { key: 'work', label: 'edit.work', unit: true },
  { key: 'rest', label: 'edit.rest', unit: true },
  { key: 'rounds', label: 'edit.rounds', unit: false },
  { key: 'sets', label: 'edit.sets', unit: false },
  { key: 'setRest', label: 'edit.setRest', unit: true },
];

type Props = {
  emoji: string;
  name: string;
  settings: Settings;
  /** Settings can only change while the timer is idle. */
  locked: boolean;
  onSave: (values: { emoji: string; name: string; settings: Settings }) => void;
  onClose: () => void;
};

const toDraft = (s: Settings): Record<keyof Settings, string> =>
  Object.fromEntries(FIELDS.map(({ key }) => [key, String(s[key])])) as Record<
    keyof Settings,
    string
  >;

const TimerEditDialog: FC<Props> = ({
  emoji,
  name,
  settings,
  locked,
  onSave,
  onClose,
}) => {
  const { t } = useI18n();
  const [draftEmoji, setDraftEmoji] = useState(emoji);
  const [draftName, setDraftName] = useState(name);
  const [draft, setDraft] = useState(() => toDraft(settings));

  const next = Object.fromEntries(
    FIELDS.map(({ key }) => [key, clampSetting(key, Number(draft[key]))]),
  ) as Settings;
  const total = totalDuration(buildSegments(next));

  const save = () =>
    onSave({
      emoji: draftEmoji,
      name: draftName.trim() || name,
      settings: locked ? settings : next,
    });

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
        aria-label={t('edit.title')}
      >
        <h2 className="dialog-title">{t('edit.title')}</h2>

        <div className="emoji-picker" role="group" aria-label={t('edit.icon')}>
          {(EMOJIS.includes(emoji) ? EMOJIS : [emoji, ...EMOJIS]).map((e) => (
            <button
              key={e}
              type="button"
              className="emoji-option"
              aria-pressed={e === draftEmoji}
              onClick={() => setDraftEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="edit-field edit-name" htmlFor="edit-name">
          <span>{t('edit.name')}</span>
          <input
            id="edit-name"
            type="text"
            maxLength={30}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        </label>

        <div className="edit-fields">
          {FIELDS.map(({ key, label, unit }) => (
            <label key={key} className="edit-field" htmlFor={`edit-${key}`}>
              <span>
                {t(label)}
                {unit && <small> ({t('edit.sec')})</small>}
              </span>
              <input
                id={`edit-${key}`}
                type="number"
                inputMode="numeric"
                value={draft[key]}
                disabled={locked}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                onBlur={() => setDraft({ ...draft, [key]: String(next[key]) })}
              />
            </label>
          ))}
        </div>

        <p className="edit-total">
          {t('edit.total')} <strong>{formatTime(total)}</strong>
          {locked && <span> · {t('edit.locked')}</span>}
        </p>

        <div className="edit-actions">
          <button type="button" className="dialog-cancel" onClick={onClose}>
            {t('dialog.cancel')}
          </button>
          <button type="button" className="dialog-save" onClick={save}>
            {t('edit.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerEditDialog;
