import { FC } from 'react';
import { buildSegments, Segment, Settings } from 'features/tabata';
import { useI18n } from 'i18n';

type Item =
  | { kind: 'prepare'; duration: number }
  | { kind: 'gap'; duration: number }
  | { kind: 'set'; set: number; segments: Segment[]; duration: number };

const toItems = (settings: Settings): Item[] => {
  const items: Item[] = [];
  buildSegments(settings).forEach((seg) => {
    if (seg.phase === 'prepare') {
      items.push({ kind: 'prepare', duration: seg.duration });

      return;
    }
    if (seg.phase === 'setRest') {
      items.push({ kind: 'gap', duration: seg.duration });

      return;
    }
    const last = items[items.length - 1];
    if (last && last.kind === 'set' && last.set === seg.set) {
      last.segments.push(seg);
      last.duration += seg.duration;
    } else {
      items.push({
        kind: 'set',
        set: seg.set,
        segments: [seg],
        duration: seg.duration,
      });
    }
  });

  return items;
};

const LEGEND = ['prepare', 'work', 'rest', 'setRest'] as const;

/**
 * Draws the cycle to scale: coloured blocks are phases, and the boxes labelled
 * "Set n" group the rounds (work + rest) that belong to one set.
 */
const CycleBar: FC<{ settings: Settings }> = ({ settings }) => {
  const { t } = useI18n();
  const items = toItems(settings);
  const rounds = t('unit.round', { n: settings.rounds });

  return (
    <div className="cycle">
      <div className="cycle-bar" aria-hidden>
        {items.map((item, i) => {
          const style = { flexGrow: item.duration };
          if (item.kind === 'set') {
            const label =
              settings.sets > 1
                ? `${t('card.set', { a: item.set, b: settings.sets })}`
                : rounds;

            return (
              <div key={`set-${item.set}`} className="cycle-set" style={style}>
                <div className="cycle-blocks">
                  {item.segments.map((seg, j) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={j}
                      className={`cycle-block cycle-${seg.phase}`}
                      style={{ flexGrow: seg.duration }}
                    />
                  ))}
                </div>
                <span className="cycle-label">{label}</span>
              </div>
            );
          }

          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`${item.kind}-${i}`}
              className="cycle-set cycle-fixed"
              style={style}
            >
              <div className="cycle-blocks">
                <span
                  className={`cycle-block cycle-${
                    item.kind === 'gap' ? 'setRest' : 'prepare'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <ul className="cycle-legend">
        {LEGEND.filter((phase) => {
          if (phase === 'prepare') return settings.prepare > 0;
          if (phase === 'rest') return settings.rest > 0;
          if (phase === 'setRest')
            return settings.sets > 1 && settings.setRest > 0;

          return true;
        }).map((phase) => (
          <li key={phase}>
            <span className={`cycle-dot cycle-${phase}`} />
            {t(`phase.${phase}`)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CycleBar;
