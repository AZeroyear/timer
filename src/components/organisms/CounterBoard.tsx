import React, { FC, useRef } from 'react';
import './CounterBoard.css';
import { ReactComponent as Play } from 'images/play.svg';
import { ReactComponent as Pause } from 'images/pause.svg';
import { ReactComponent as Replay } from 'images/replay.svg';
import { getTime, TimerProps } from '../../features/counter';

type Props = {
  timer: TimerProps;
  breakTimer: TimerProps;
  resetSwitch: () => void;
  startSwitch: () => void;
  inputChange: (a: string, b: string, c: number) => void;
  timerCycle: boolean;
};

const CounterBoard: FC<Props> = ({
  timer,
  breakTimer,
  inputChange,
  resetSwitch = () => undefined,
  startSwitch = () => undefined,
  timerCycle,
}) => {
  const current = getTime(timer.current);
  const currentBreak = getTime(breakTimer.current);
  const timeMin = useRef<HTMLInputElement>(null);
  const timeSec = useRef<HTMLInputElement>(null);
  const breakMin = useRef<HTMLInputElement>(null);
  const breakSec = useRef<HTMLInputElement>(null);

  const timeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputChange(
      timeMin.current?.value || '00',
      timeSec.current?.value || '00',
      0,
    );
  };

  const breakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputChange(
      breakMin.current?.value || '00',
      breakSec.current?.value || '00',
      1,
    );
  };

  return (
    <section className="flex-center">
      <div
        className={`tomato flex-row-tomato${
          timer.on || breakTimer.on ? ' tomato-start' : ''
        }`}
      >
        <div className="input-segment">
          <p>CONCENTRATE</p>
          <div className={`flex-center${timer.on ? ' on' : ' off'}`}>
            <input
              type="text"
              ref={timeMin}
              onChange={timeChange}
              value={current.split(':')[0]}
              className="input-area"
            />
            :
            <input
              type="text"
              ref={timeSec}
              onChange={timeChange}
              value={current.split(':')[1]}
              className="input-area"
            />
          </div>
        </div>
        {timerCycle && (
          <div className="input-segment">
            <p>STRECH / RELAX</p>
            <div className={`flex-center${breakTimer.on ? ' on' : ' off'}`}>
              <input
                type="text"
                ref={breakMin}
                onChange={breakChange}
                value={currentBreak.split(':')[0]}
                className="input-area"
              />
              :
              <input
                type="text"
                ref={breakSec}
                onChange={breakChange}
                value={currentBreak.split(':')[1]}
                className="input-area"
              />
            </div>
          </div>
        )}
        <div className="flex-center" style={{ height: 80 }}>
          <div className="start-button">
            <button
              type="button"
              onClick={() => startSwitch()}
              className="large-icon-button start-stop"
            >
              {timer.on || breakTimer.on ? (
                <Pause className="pause" />
              ) : (
                <Play className="play" />
              )}
            </button>
            <button type="button" className="replay" onClick={resetSwitch}>
              <Replay />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterBoard;
