import { FC, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";

import { counterState } from "features/counter";
import CounterBoard from "components/organisms/CounterBoard";

const EnhancedCounterBoard: FC = () => {
  const [timer, setCount] = useRecoilState(counterState);
  const inputMin = useRef<HTMLInputElement>(null);
  const inputSec = useRef<HTMLInputElement>(null);

  const inputChange = () => {
    const min = Number(inputMin.current?.value) * 60 * 1000;
    const sec = Number(inputSec.current?.value) * 1000;
    const set = min + sec;
    const current = set;
    setCount((currentState) => {
      return { ...currentState, set, current };
    });
  };

  const resetSwitch = () => {
    setCount((currentState) => {
      return { ...currentState, current: timer.set, on: false };
    });
  };
  const startSwitch = () => {
    if (!timer.on) {
      const start = Date.now() - (timer.set - timer.current);
      setCount((currentState) => {
        return { ...currentState, ...{ start }, on: !timer.on };
      });
    } else {
      setCount((currentState) => {
        return { ...currentState, on: !timer.on };
      });
    }
  };

  const notify = () => {
    Notification.requestPermission();
    const options = {
      requireInteraction: true,
    };
    const notification = new Notification("Strech", options);
    notification.onclose = () =>
      setCount((currentState) => {
        return {
          ...currentState,
          current: timer.set,
          start: Date.now(),
          on: true,
        };
      });

    return notification;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timer.on) {
        const current = timer.start + timer.set - Date.now();
        if (current <= 0) {
          setCount({ ...timer, on: false });
          notify();
        } else {
          setCount((currentState) => {
            return { ...currentState, ...{ current } };
          });
        }
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer, setCount]);

  return (
    <>
      <CounterBoard
        count={timer.current}
        on={timer.on}
        {...{ resetSwitch, startSwitch, inputMin, inputSec, inputChange }}
      />
    </>
  );
};

export default EnhancedCounterBoard;
