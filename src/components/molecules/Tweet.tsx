import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { totalCount, getTime } from 'features/counter';
import { ReactComponent as Twitter } from 'images/twitter.svg';
import '../organisms/CounterBoard.css';
import './Dialog.css';

const Tweet: FC = () => {
  const [total, _setTotal] = useRecoilState(totalCount);

  return (
    <div className="flex-center" style={{ marginTop: 30 }}>
      <div className="flex-center">
        <a
          href={`https://twitter.com/share?text=I've done Pomodoro timer at ${
            total.count
          } cycle (Concentrated ${getTime(total.time)})&url=${
            window.location.host
          }`}
          className="flex-center ripple tweet-button"
          target="_blank"
          rel="noreferrer"
        >
          <Twitter className="icon" style={{ marginRight: 0 }} />
          <div className="setting">
            <strong style={{ marginLeft: 10, fontSize: 18 }}>
              {total.count}
            </strong>{' '}
            cycle
          </div>
        </a>
      </div>
    </div>
  );
};

export default Tweet;
