import { FC } from 'react';
import { ReactComponent as Twitter } from 'images/twitter.svg';
import '../organisms/CounterBoard.css';
import './Dialog.css';

type Props = {
  total: { count: number; workTime: number };
};

const formatWorkTime = (ms: number): string => {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);

  return `${min}m ${sec % 60}s`;
};

const Tweet: FC<Props> = ({ total }) => (
  <div className="flex-center" style={{ marginTop: 30 }}>
    <a
      href={`https://twitter.com/share?text=${encodeURIComponent(
        `I've done Tabata timer ${
          total.count
        } workout(s) (Worked ${formatWorkTime(total.workTime)})`,
      )}&url=${encodeURIComponent(window.location.origin)}`}
      className="flex-center ripple tweet-button"
      target="_blank"
      rel="noreferrer"
    >
      <Twitter className="icon" style={{ marginRight: 0 }} />
      <div className="setting">
        <strong style={{ marginLeft: 10, fontSize: 18 }}>{total.count}</strong>{' '}
        workout
      </div>
    </a>
  </div>
);

export default Tweet;
