import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState } from 'features/dialog';
import { notifyState } from 'features/counter';
import {
  DialogContent,
  DialogFooter,
  DialogButton,
} from '@material/react-dialog';
import '@material/react-dialog/dist/dialog.css';
import { ReactComponent as Dvr } from 'images/dvr.svg';
import './Dialog.css';
import '../organisms/CounterBoard.css';
import DenyChrome from '../atom/DenyChrome';
import DenySafari from '../atom/DenySafari';

const DialogDesktopDeny: FC = () => {
  const [dialog, _setDialogState] = useRecoilState(dialogState);
  const [notify, _setNotify] = useRecoilState(notifyState);

  return dialog.desktopDeny ? (
    <>
      <DialogContent>
        <div className="flex-center m-0">
          <Dvr className="icon" />
          <p>
            Desktop push notification is <strong>denied</strong>
          </p>
        </div>
        <p className="flex-center m-0">
          デスクトップ通知が拒否の状態になっています。
        </p>
        {notify.browser === 3 && <DenyChrome />}
        {notify.browser === 2 && <DenySafari />}
      </DialogContent>
      <DialogFooter>
        <DialogButton action="discard" isDefault>
          OK
        </DialogButton>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogDesktopDeny;
