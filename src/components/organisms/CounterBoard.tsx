import React, { FC } from "react";
import "./CounterBoard.css";
import { getTime } from "../../features/counter";
import { ReactComponent as Play } from "images/play.svg";
import { ReactComponent as Pause } from "images/pause.svg";
import { ReactComponent as Replay } from "images/replay.svg";

type Props = {
  count?: number;
  resetSwitch: () => void;
  startSwitch: () => void;
  inputMin: React.RefObject<HTMLInputElement>;
  inputSec: React.RefObject<HTMLInputElement>;
  inputChange: () => void;
  on: boolean;
};

const CounterBoard: FC<Props> = ({
  count = 0,
  inputMin,
  inputSec,
  inputChange,
  resetSwitch = () => undefined,
  startSwitch = () => undefined,
  on = false,
}) => {
  const current = getTime(count);

  return (
    <div>
      <div className="flex-center">
        <h1>Time</h1>
      </div>
      <div>
        <h1>
          <input
            type="text"
            ref={inputMin}
            onChange={inputChange}
            value={current.split(":")[0]}
            className="input-area"
          />
          :
          <input
            type="text"
            ref={inputSec}
            onChange={inputChange}
            value={current.split(":")[1]}
            className="input-area"
          />
        </h1>
      </div>
      <div>
        <div className="flex-center">
          <button onClick={startSwitch} className="ripple">
            {on ? <Pause fill="#fff" /> : <Play fill="#fff" />}
          </button>
          <button className="ripple" onClick={resetSwitch}>
            <Replay fill="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounterBoard;
