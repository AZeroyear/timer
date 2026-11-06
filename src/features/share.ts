import { Translate } from 'i18n';
import {
  buildSegments,
  formatTime,
  Settings,
  totalDuration,
} from 'features/tabata';

export const APP_NAME = 'Loopy Timer';
export const APP_URL = 'https://timer.eastazy.com/';
export const HASHTAG = '#LoopyTimer';

export type Shareable = {
  emoji: string;
  name: string;
  settings: Settings;
};

/** e.g. "4 rounds", "2 sets × 10 rounds". */
export const cycleLabel = ({ rounds, sets }: Settings, t: Translate): string =>
  sets > 1
    ? t('unit.setsOfRounds', {
        sets: t('unit.set', { n: sets }),
        rounds: t('unit.round', { n: rounds }),
      })
    : t('unit.round', { n: rounds });

/** 20 -> "20s", 1500 -> "25 min", 90 -> "1m30s". */
export const secondsLabel = (sec: number, t: Translate): string => {
  if (sec < 60) return t('unit.sec', { n: sec });
  if (sec % 60 === 0) return t('unit.min', { n: sec / 60 });

  return t('unit.minSec', { m: Math.floor(sec / 60), s: sec % 60 });
};

/** e.g. "25 min work / 5 min rest". */
export const intervalLabel = ({ work, rest }: Settings, t: Translate): string =>
  rest > 0
    ? t('interval.workRest', {
        work: secondsLabel(work, t),
        rest: secondsLabel(rest, t),
      })
    : t('interval.work', { work: secondsLabel(work, t) });

export const totalLabel = (settings: Settings): string =>
  formatTime(totalDuration(buildSegments(settings)));

export type SessionSummary = { sessions: number; streak: number };

/** "Session #5 · 3-day streak" (empty for a first session). */
export const summaryLabel = (
  summary: SessionSummary | undefined,
  t: Translate,
): string => {
  if (!summary || (summary.sessions < 2 && summary.streak < 2)) return '';

  return [
    t('share.sessions', { n: summary.sessions }),
    summary.streak > 1 ? t('share.streak', { n: summary.streak }) : '',
  ]
    .filter(Boolean)
    .join(' · ');
};

export const buildShareText = (
  item: Shareable,
  t: Translate,
  summary?: SessionSummary,
): string => {
  const extra = summaryLabel(summary, t);

  return `${t('share.text', {
    emoji: item.emoji,
    name: item.name,
    cycle: cycleLabel(item.settings, t),
    interval: intervalLabel(item.settings, t),
    total: totalLabel(item.settings),
  })}${extra ? `\n${extra}` : ''}\n${HASHTAG}`;
};

export const tweetUrl = (text: string, url: string = APP_URL): string =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(url)}`;

const W = 1080;
const H = 1350; // 4:5, fits an Instagram feed post

/** Draws a share card (PNG). Rejects when canvas is unavailable. */
export const renderShareImage = (
  item: Shareable,
  t: Translate,
  summary?: SessionSummary,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas is not supported'));

      return;
    }
    const font =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif';

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#ff1744');
    bg.addColorStop(1, '#ff8a50');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff22';
    ctx.beginPath();
    ctx.arc(W - 60, 160, 340, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `260px ${font}`;
    ctx.fillText(item.emoji, W / 2, 330);

    ctx.font = `bold 84px ${font}`;
    ctx.fillText(item.name, W / 2, 560, W - 120);

    ctx.font = `bold 64px ${font}`;
    ctx.fillText(t('share.done'), W / 2, 650);

    ctx.font = `bold 130px ${font}`;
    ctx.fillText(cycleLabel(item.settings, t), W / 2, 820, W - 120);

    ctx.font = `56px ${font}`;
    ctx.fillText(intervalLabel(item.settings, t), W / 2, 960, W - 120);
    ctx.fillText(
      `${totalLabel(item.settings)} ${t('share.inTotal')}`,
      W / 2,
      1040,
    );

    const extra = summaryLabel(summary, t);
    if (extra) {
      ctx.font = `bold 56px ${font}`;
      ctx.fillText(extra, W / 2, 1130, W - 120);
    }

    ctx.font = `bold 52px ${font}`;
    ctx.fillText(APP_NAME, W / 2, 1230);
    ctx.font = `36px ${font}`;
    ctx.fillText(APP_URL.replace('https://', ''), W / 2, 1285);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create the image'));
    }, 'image/png');
  });
