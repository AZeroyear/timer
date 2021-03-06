import React, { FC, useRef, useState } from 'react';
import './CounterBoard.css';
import { ReactComponent as Play } from 'images/play.svg';
import { ReactComponent as Pause } from 'images/pause.svg';
import { ReactComponent as Replay } from 'images/replay.svg';
import { ReactComponent as Edit } from 'images/edit.svg';
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

  const [editNumber, setEdit] = useState(0);

  const editHandle = () => {
    const newEditNumber = editNumber < 4 ? editNumber + 1 : 1;
    switch (newEditNumber) {
      case 1:
        timeMin.current?.focus();
        break;
      case 2:
        timeSec.current?.focus();
        break;
      case 3:
        breakMin.current?.focus();
        break;
      case 4:
        breakSec.current?.focus();
        break;
      default:
        break;
    }
    setEdit(newEditNumber);
  };

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
        className={`tomato flex-row-tomato${timer.on ? ' tomato-start' : ''}${
          breakTimer.on ? ' break-point' : ''
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
            <div
              className={`flex-center${
                breakTimer.on ? ' on break-point' : ' off'
              }`}
            >
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
        <div className="flex-center" style={{ height: 60 }}>
          <div className="start-button">
            <button
              type="button"
              onClick={() => startSwitch()}
              className="large-icon-button start-stop"
            >
              {timer.on || breakTimer.on ? (
                <Pause
                  className={`pause${breakTimer.on ? ' break-point' : ''}`}
                />
              ) : (
                <Play
                  className={`play${
                    breakTimer.set !== breakTimer.current ? ' break-hover' : ''
                  }`}
                />
              )}
            </button>
            <button type="button" className="replay" onClick={resetSwitch}>
              <Replay />
            </button>
            <button type="button" className="replay edit" onClick={editHandle}>
              <Edit />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterBoard;
