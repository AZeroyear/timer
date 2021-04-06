import { FC, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { counterState, breakState, notifyState } from 'features/counter';
import { dialogState } from 'features/dialog';
import CounterBoard from 'components/organisms/CounterBoard';
import NotifyType from 'components/molecules/NotifyType';
import notificationVerfy from 'features/notificationVerify';
import DialogForm from 'components/molecules/DialogForm';
import { notifyAlert, notifyDesktop } from 'features/notify';

const EnhancedCounterBoard: FC = () => {
  const [timer, setCount] = useRecoilState(counterState);
  const [breakTimer, setBreak] = useRecoilState(breakState);
  const [notify, setNotify] = useRecoilState(notifyState);
  const [_dialog, setDialogState] = useRecoilState(dialogState);

  const setStateChange = (
    timeType: number,
  ): [typeof timer, typeof setCount] => {
    return [
      timeType === 0 ? timer : breakTimer,
      timeType === 0 ? setCount : setBreak,
    ];
  };

  const inputChange = (minTime: string, secTime: string, timeType: number) => {
    const min = Number(minTime) * 60 * 1000;
    const sec = Number(secTime) * 1000;
    const set = min + sec;
    const current = set;
    const [_, setState] = setStateChange(timeType);
    setState((currentState) => {
      return { ...currentState, set, current };
    });
  };

  const resetSwitch = () => {
    setCount((currentState) => {
      return { ...currentState, current: timer.set, on: false };
    });
    setBreak((c) => ({ ...c, current: c.set, on: false }));
  };

  const startSwitch = () => {
    if (notify.select === 0 || notify.cycle === 0) {
      setDialogState((c) => ({ ...c, dialog: true, initial: true }));
    }
    if (timer.on) setCount((c) => ({ ...c, on: false }));
    if (breakTimer.on) setBreak((c) => ({ ...c, on: false }));
    if (!timer.on && !breakTimer.on) {
      const start = Date.now() - (timer.set - timer.current);

      if (timer.set !== timer.current) {
        setCount((c) => ({ ...c, start, on: true }));
      } else if (breakTimer.set !== breakTimer.current) {
        setBreak((c) => ({
          ...c,
          start: Date.now() - (breakTimer.set - breakTimer.current),
          on: true,
        }));
      } else {
        setCount((c) => ({ ...c, start, on: true }));
      }
    }
  };

  const notifyCall = (timeType: number) => {
    const [timerState, setState] = setStateChange(timeType);

    if (notify.cycle === 2) {
      const setTimer = () => {
        setState((c) => ({
          ...c,
          current: timerState.set,
          start: Date.now(),
          on: true,
        }));
      };

      if (notify.select === 0 || notify.select === 1) {
        notifyAlert(timeType);
        setTimer();
      }
      if (notify.select === 2) notifyDesktop(timeType, setTimer);

      return;
    }

    setState((currentState) => {
      return {
        ...currentState,
        current: timerState.set,
        start: Date.now(),
        on: false,
      };
    });

    setStateChange(timeType === 0 ? 1 : 0)[1]((currentState) => {
      return { ...currentState, start: Date.now(), on: true };
    });

    if (notify.cycle === 1) {
      if (notify.select === 0 || notify.select === 1) notifyAlert(timeType);
      if (notify.select === 2) notifyDesktop(timeType);
    }
  };

  useEffect(() => {
    setNotify({ ...notificationVerfy(), cycle: 0, select: 0 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timer.on) {
        const current = timer.start + timer.set - Date.now();
        if (current <= 0) {
          setCount({ ...timer, on: false });
          notifyCall(0);
        } else {
          setCount((currentState) => {
            return { ...currentState, ...{ current } };
          });
        }
      }
      if (breakTimer.on) {
        const current = breakTimer.start + breakTimer.set - Date.now();
        if (current <= 0) {
          setBreak({ ...breakTimer, on: false });
          notifyCall(1);
        } else {
          setBreak((currentState) => {
            return { ...currentState, ...{ current } };
          });
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer, setCount, breakTimer, setBreak]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <CounterBoard
        {...{
          timer,
          breakTimer,
          resetSwitch,
          startSwitch,
          inputChange,
        }}
        timerCycle={notify.cycle !== 2}
      />
      <NotifyType />
      <DialogForm />
    </>
  );
};

export default EnhancedCounterBoard;
