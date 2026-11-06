import { FC, useState } from 'react';
import { EMOJIS } from 'features/presets';
import CycleBar from 'components/molecules/CycleBar';
import { MessageKey, useI18n } from 'i18n';
import {
  buildSegments,
  clampSetting,
  formatTime,
  Settings,
  totalDuration,
} from 'features/tabata';

type DurationKey = 'prepare' | 'work' | 'rest' | 'setRest';
type CountKey = 'rounds' | 'sets';
type Field =
  | { kind: 'time'; key: DurationKey; label: MessageKey }
  | { kind: 'count'; key: CountKey; label: MessageKey };

// Two columns on a phone: Prepare / Work, Rest / Rounds, Sets / Set rest.
const FIELDS: Field[] = [
  { kind: 'time', key: 'prepare', label: 'edit.prepare' },
  { kind: 'time', key: 'work', label: 'edit.work' },
  { kind: 'time', key: 'rest', label: 'edit.rest' },
  { kind: 'count', key: 'rounds', label: 'edit.rounds' },
  { kind: 'count', key: 'sets', label: 'edit.sets' },
  { kind: 'time', key: 'setRest', label: 'edit.setRest' },
];

/** Times are typed as minutes + seconds (25 min is easier than 1500 s). */
type Draft = Record<keyof Settings, { min: string; sec: string }>;

const toDraft = (s: Settings): Draft => {
  const draft = {} as Draft;
  (Object.keys(s) as (keyof Settings)[]).forEach((key) => {
    draft[key] = {
      min: String(Math.floor(s[key] / 60)),
      sec: String(s[key] % 60),
    };
  });

  return draft;
};

const numberOf = (v: string): number => (v.trim() === '' ? 0 : Number(v));

const fromDraft = (draft: Draft): Settings => {
  const next = {} as Settings;
  FIELDS.forEach(({ kind, key }) => {
    const d = draft[key];
    const raw =
      kind === 'time'
        ? numberOf(d.min) * 60 + numberOf(d.sec)
        : numberOf(d.sec);
    next[key] = clampSetting(key, raw);
  });

  return next;
};

type Props = {
  emoji: string;
  name: string;
  settings: Settings;
  /** Settings can only change while the timer is idle. */
  locked: boolean;
  onSave: (values: { emoji: string; name: string; settings: Settings }) => void;
  onClose: () => void;
};

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
  // Counts (rounds / sets) use the `sec` slot to hold their plain number.
  const [draft, setDraft] = useState<Draft>(() => {
    const d = toDraft(settings);
    FIELDS.forEach(({ kind, key }) => {
      if (kind === 'count') d[key] = { min: '0', sec: String(settings[key]) };
    });

    return d;
  });

  const next = fromDraft(draft);
  const total = totalDuration(buildSegments(next));

  const change = (key: keyof Settings, part: 'min' | 'sec', value: string) =>
    setDraft({ ...draft, [key]: { ...draft[key], [part]: value } });

  // Tidy the fields once the user leaves them (90 s becomes 1 min 30 s).
  const tidy = (key: keyof Settings, kind: Field['kind']) => {
    const value = next[key];
    setDraft({
      ...draft,
      [key]:
        kind === 'time'
          ? { min: String(Math.floor(value / 60)), sec: String(value % 60) }
          : { min: '0', sec: String(value) },
    });
  };

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
          {FIELDS.map(({ kind, key, label }) => {
            const disabled = locked || (key === 'setRest' && next.sets <= 1);
            const text = t(label);

            if (kind === 'count') {
              return (
                <label key={key} className="edit-field" htmlFor={`edit-${key}`}>
                  <span>{text}</span>
                  <input
                    id={`edit-${key}`}
                    type="number"
                    inputMode="numeric"
                    value={draft[key].sec}
                    disabled={disabled}
                    onChange={(e) => change(key, 'sec', e.target.value)}
                    onBlur={() => tidy(key, kind)}
                  />
                </label>
              );
            }

            return (
              <div
                key={key}
                className="edit-field"
                role="group"
                aria-label={text}
              >
                <span>{text}</span>
                <div className="edit-time">
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${text} ${t('edit.min')}`}
                    value={draft[key].min}
                    disabled={disabled}
                    onChange={(e) => change(key, 'min', e.target.value)}
                    onBlur={() => tidy(key, kind)}
                  />
                  <small>{t('edit.min')}</small>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${text} ${t('edit.sec')}`}
                    value={draft[key].sec}
                    disabled={disabled}
                    onChange={(e) => change(key, 'sec', e.target.value)}
                    onBlur={() => tidy(key, kind)}
                  />
                  <small>{t('edit.sec')}</small>
                </div>
              </div>
            );
          })}
        </div>

        <CycleBar settings={next} />
        <p className="edit-hint">
          {t('edit.hint')}
          {next.sets <= 1 && ` ${t('edit.setRestOff')}`}
        </p>

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
