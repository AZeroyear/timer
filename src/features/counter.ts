/* eslint-disable import/prefer-default-export */
import { atom } from "recoil";

export const counterState = atom({
  key: "counter",
  default: {
    start: Date.now(),
    set: 1500000,
    current: 1500000,
    on: false,
  },
});

export const getTime = (time: number) => {
  const second = time / 1000;
  const min = Math.floor(second / 60);
  const sec = Math.floor(second % 60);

  return (
    ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2)
  );
};