import React, { FC } from "react";
import "./CounterBoard.css";
import { getTime } from "../../features/counter";

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
          <button onClick={startSwitch}>{on ? "STOP" : "START"}</button>
          <button color="red" onClick={resetSwitch}>
            RESET
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounterBoard;
