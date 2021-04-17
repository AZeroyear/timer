import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState, initialDialog } from 'features/dialog';
import { notifyState } from 'features/counter';
import {
  DialogContent,
  DialogFooter,
  DialogButton,
} from '@material/react-dialog';
import '@material/react-dialog/dist/dialog.css';
import './Dialog.css';
import '../organisms/CounterBoard.css';
import { ReactComponent as Cycle } from 'images/cycle.svg';
import { ReactComponent as Click } from 'images/click.svg';
import { ReactComponent as Timer } from 'images/timer.svg';

const DialogCycleSelect: FC = () => {
  const [dialog, setDialogState] = useRecoilState(dialogState);
  const [notify, setNotify] = useRecoilState(notifyState);

  const handleClick = () => {
    if (notify.permission === 1) {
      setDialogState(initialDialog);
    } else if (notify.permission === 2) {
      setDialogState({
        ...initialDialog,
        dialog: true,
        desktopDeny: true,
      });
    } else {
      setDialogState({
        ...dialog,
        notifySelect: false,
        desktopAllow: true,
      });
    }
  };

  return dialog.notifySelect ? (
    <>
      <DialogContent>
        <div className="flex-center">
          <Cycle className="icon" />
          <p className="m-0">Please select Timer Start Cycle</p>
        </div>
        <p className="m-0 flex-center">
          タイマーのスタート方法を選んでください。
        </p>
        <button
          type="button"
          onClick={() => {
            handleClick();
            setNotify({ ...notify, cycle: 1 });
          }}
          className="border flex-row"
        >
          <div>
            <div className="flex-center">
              <Timer className="icon" />
              <p className="m-0">
                Timer Cycle{' '}
                <span style={{ fontWeight: 'bold' }}>(Default)</span>
              </p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p>- Two timer is provided (Concentrate Timer, Relax Timer)</p>
              <p>- After each timer end, next timer start.</p>
              <p>Normal way for pomodoro technique.</p>
              <p style={{ marginTop: 10 }}>
                時間に合わせてタイマーがセットされます。通常のポモドーロの方法です。
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            handleClick();
            setNotify({ ...notify, cycle: 2 });
          }}
          className="border flex-row"
        >
          <div>
            <div className="flex-center">
              <Click className="icon" />
              <p className="m-0">Click Cycle</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p>- One timer is provided (Concentrate Timer)</p>
              <p>
                - After close{' '}
                <span style={{ fontWeight: 'bold' }}>Desktop Notification</span>{' '}
                by click, next cycle start.
              </p>
              <p>
                After finish strech, you can start next Concentrate by click
                close.
              </p>
              <p style={{ marginTop: 10 }}>
                クリックでタイマーがスタートします。
              </p>
              <p>ストレッチが終わったら直ぐに仕事を始めたい方向けです。</p>
            </div>
          </div>
        </button>
      </DialogContent>
      <DialogFooter>
        <DialogButton action="dismiss">Cancel</DialogButton>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogCycleSelect;
