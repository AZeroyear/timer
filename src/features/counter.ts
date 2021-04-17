/* eslint-disable import/prefer-default-export */
import { atom, useRecoilState } from 'recoil';

export const counterState = atom({
  key: 'counter',
  default: {
    start: Date.now(),
    set: 1500000,
    current: 1500000,
    on: false,
  },
});

export const breakState = atom({
  key: 'break',
  default: {
    start: Date.now(),
    set: 300000,
    current: 300000,
    on: false,
  },
});

export const totalCount = atom({
  key: 'total',
  default: { count: 0, time: 0 },
});

export const notifyState = atom({
  key: 'notify',
  default: {
    support: false,
    permission: 0,
    browser: 0,
    cycle: 0,
    select: 0,
  },
});

export const cycleSelect = (cycle: number): string => {
  if (cycle === 0) return 'Not select';
  if (cycle === 1) return 'Timer Cycle';
  if (cycle === 2) return 'Click Cycle';

  return 'Not select';
};

export const notifySelect = (select: number): string => {
  if (select === 0) return 'Not select';
  if (select === 1) return 'Alert';
  if (select === 2) return 'Desktop';
  if (select === 4) return 'No Notify';

  return 'Not select';
};

export type TimerProps = {
  start: number;
  set: number;
  current: number;
  on: boolean;
};

type Props = {
  start?: number;
  set?: number;
  current?: number;
  on?: boolean;
};

export const useCounter = (newState: Props): void => {
  const [timer, setCount] = useRecoilState(counterState);

  setCount({ ...timer, ...newState });
};

export const getTime = (time: number): string => {
  const second = time / 1000;
  const min = Math.floor(second / 60);
  const sec = Math.floor(second % 60);

  return `${`00${min.toString()}`.slice(-2)}:${`00${sec.toString()}`.slice(
    -2,
  )}`;
};
