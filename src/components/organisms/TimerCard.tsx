import { FC } from 'react';
import Icon from 'components/atoms/Icon';
import {
  buildSegments,
  computeProgress,
  formatTime,
  totalDuration,
} from 'features/tabata';
import { TimerItem } from 'features/timers';
import { useI18n } from 'i18n';
import './TimerList.css';

type Props = {
  timer: TimerItem;
  now: number;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
};

const TimerCard: FC<Props> = ({
  timer,
  now,
  onStart,
  onPause,
  onReset,
  onRemove,
  onEdit,
  onShare,
}) => {
  const { t } = useI18n();
  const { id, emoji, name, presetName, settings, run } = timer;
  const segments = buildSegments(settings);
  const total = totalDuration(segments);
  const elapsed = run.accumulated + (run.running ? now - run.startedAt : 0);
  const progress = computeProgress(segments, elapsed);
  const idle = !run.running && run.accumulated === 0;
  const finished = progress.phase === 'done';

  let label = t(`phase.${progress.phase}`);
  if (idle) label = t('phase.ready');
  else if (!run.running && !finished) label = t('phase.paused');

  const percent = Math.min(100, (elapsed / total) * 100);
  const phaseClass = idle ? 'idle' : progress.phase;

  return (
    <li className={`timer-card phase-${phaseClass}`}>
      <div className="timer-card-head">
        <button
          type="button"
          className="timer-card-title"
          aria-label={t('card.edit', { name })}
          onClick={() => onEdit(id)}
        >
          <p className="timer-card-name">
            <span className="timer-card-emoji" aria-hidden>
              {emoji}
            </span>
            {name}
          </p>
          <p className="timer-card-sub">
            {presetName && `${presetName} · `}
            {t('card.round', {
              a: Math.min(progress.round, settings.rounds),
              b: settings.rounds,
            })}
            {settings.sets > 1 &&
              ` · ${t('card.set', { a: progress.set, b: settings.sets })}`}
          </p>
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={t('card.settings', { name })}
          onClick={() => onEdit(id)}
        >
          <Icon name="edit" size={22} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={t('card.reset', { name })}
          disabled={idle}
          onClick={() => onReset(id)}
        >
          <Icon name="replay" size={22} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={t('card.delete', { name })}
          disabled={run.running}
          onClick={() => onRemove(id)}
        >
          <Icon name="close" size={22} />
        </button>
      </div>

      <div className="timer-card-body">
        <div>
          <p className="timer-card-phase">{label}</p>
          <p className="timer-card-time">
            {formatTime(finished ? 0 : progress.remaining)}
          </p>
        </div>
        <button
          type="button"
          className="timer-card-main"
          aria-label={
            run.running ? t('card.pause', { name }) : t('card.start', { name })
          }
          disabled={finished}
          onClick={() => (run.running ? onPause(id) : onStart(id))}
        >
          <Icon name={run.running ? 'pause' : 'play'} size={32} />
        </button>
      </div>

      <div className="timer-card-bar" aria-hidden>
        <div className="timer-card-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="timer-card-total">
        {t('card.totalLeft', {
          time: formatTime(finished ? 0 : total - elapsed),
        })}
      </p>
      {finished && (
        <button
          type="button"
          className="timer-card-share"
          aria-label={t('card.shareLabel', { name })}
          onClick={() => onShare(id)}
        >
          <Icon name="share" size={18} />
          {t('card.share')}
        </button>
      )}
    </li>
  );
};

export default TimerCard;
