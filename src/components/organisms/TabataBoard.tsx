import { FC, useEffect, useState } from 'react';
import { ReactComponent as Play } from 'images/play.svg';
import { ReactComponent as Pause } from 'images/pause.svg';
import { ReactComponent as Replay } from 'images/replay.svg';
import {
  clampSetting,
  defaultSettings,
  formatTime,
  Phase,
  Progress,
  Settings,
} from 'features/tabata';
import './Tabata.css';

const PHASE_LABEL: Record<Phase, string> = {
  prepare: 'GET READY',
  work: 'WORK',
  rest: 'REST',
  setRest: 'SET REST',
  done: 'DONE',
};

const FIELDS: { key: keyof Settings; label: string; unit: string }[] = [
  { key: 'prepare', label: 'Prepare', unit: 'sec' },
  { key: 'work', label: 'Work', unit: 'sec' },
  { key: 'rest', label: 'Rest', unit: 'sec' },
  { key: 'rounds', label: 'Rounds', unit: '' },
  { key: 'sets', label: 'Sets', unit: '' },
  { key: 'setRest', label: 'Set rest', unit: 'sec' },
];

const PRESETS: { name: string; values: Settings }[] = [
  { name: 'Tabata 20/10 ×8', values: defaultSettings },
  {
    name: 'Beginner 20/20 ×6',
    values: { ...defaultSettings, rest: 20, rounds: 6 },
  },
];

type FieldProps = {
  name: keyof Settings;
  label: string;
  unit: string;
  value: number;
  disabled: boolean;
  onCommit: (key: keyof Settings, value: number) => void;
};

const SettingField: FC<FieldProps> = ({
  name,
  label,
  unit,
  value,
  disabled,
  onCommit,
}) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const next = clampSetting(name, Number(draft));
    setDraft(String(next));
    onCommit(name, next);
  };

  return (
    <label className="tabata-field" htmlFor={`tabata-${name}`}>
      <span>
        {label}
        {unit && <small> ({unit})</small>}
      </span>
      <input
        id={`tabata-${name}`}
        type="number"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    </label>
  );
};

type Props = {
  settings: Settings;
  progress: Progress;
  running: boolean;
  idle: boolean;
  finished: boolean;
  total: number;
  elapsed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onChange: (settings: Settings) => void;
};

const TabataBoard: FC<Props> = ({
  settings,
  progress,
  running,
  idle,
  finished,
  total,
  elapsed,
  onStart,
  onPause,
  onReset,
  onChange,
}) => {
  const { phase } = progress;
  let label = PHASE_LABEL[phase];
  if (idle) label = 'READY';
  else if (!running && !finished) label = 'PAUSED';

  const shown = finished ? 0 : progress.remaining;
  const remainingAll = finished ? 0 : total - elapsed;

  return (
    <section className="flex-center tabata-section">
      <div className={`tabata-board phase-${idle ? 'idle' : phase}`}>
        <p className="tabata-phase">{label}</p>
        <p className="tabata-time" aria-live="off">
          {formatTime(idle ? progress.remaining : shown)}
        </p>
        <p className="tabata-info">
          Round {Math.min(progress.round, settings.rounds)}/{settings.rounds}
          {settings.sets > 1 && ` · Set ${progress.set}/${settings.sets}`}
        </p>
        <p className="tabata-info">Total left {formatTime(remainingAll)}</p>
        <div className="tabata-controls">
          <button
            type="button"
            className="large-icon-button"
            aria-label={running ? 'Pause' : 'Start'}
            onClick={running ? onPause : onStart}
          >
            {running ? <Pause className="pause" /> : <Play className="play" />}
          </button>
          <button
            type="button"
            className="tabata-reset"
            aria-label="Reset"
            onClick={onReset}
          >
            <Replay />
          </button>
        </div>
      </div>

      <div className="tabata-settings">
        <div className="tabata-presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              disabled={!idle}
              onClick={() => onChange(p.values)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="tabata-fields">
          {FIELDS.map((f) => (
            <SettingField
              key={f.key}
              name={f.key}
              label={f.label}
              unit={f.unit}
              value={settings[f.key]}
              disabled={!idle}
              onCommit={(key, value) =>
                value !== settings[key] &&
                onChange({ ...settings, [key]: value })
              }
            />
          ))}
        </div>
        {!idle && <p className="tabata-hint">Reset to change settings.</p>}
      </div>
    </section>
  );
};

export default TabataBoard;
