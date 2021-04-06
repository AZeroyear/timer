/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';

export const initialDialog = {
  dialog: false,
  initial: false,
  notifySelect: false,
  desktopAllow: false,
  desktopDeny: false,
};

export const dialogState = atom({
  key: 'dialog',
  default: initialDialog,
});
