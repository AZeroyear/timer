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
          <p>Desktop Notification</p>
        </div>
      </DialogContent>
      <DialogFooter>
        <button
          type="button"
          onClick={() => {
            handleClick();
            setNotify({ ...notify, cycle: 1 });
          }}
          className="border flex-row"
        >
          <div className="flex-center">
            <p>Timer Cycle</p>
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
          <div className="flex-center">
            <p>Click Cycle</p>
          </div>
        </button>
        <DialogButton action="dismiss">Cancel</DialogButton>
        <DialogButton action="discard" isDefault>
          Discard
        </DialogButton>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogCycleSelect;
