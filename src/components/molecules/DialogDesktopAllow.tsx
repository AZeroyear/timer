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
import DesktopAllow from 'images/desktop_allow.png';
import { ReactComponent as Dvr } from 'images/dvr.svg';
import './Dialog.css';
import '../organisms/CounterBoard.css';
import { desktopNotifyPermission } from 'features/desktopNotify';
import notificationVerify from 'features/notificationVerify';
// import SelectNotify from 'components/atom/SelectNotify';

const DialogNotifySelect: FC = () => {
  const [dialog, setDialogState] = useRecoilState(dialogState);
  const [notify, setNotify] = useRecoilState(notifyState);

  const handleClick = () => {
    if (notify.permission === 0) {
      desktopNotifyPermission(() => {
        const nofityStatus = notificationVerify();
        if (nofityStatus.permission === 1) {
          setNotify({
            ...notify,
            ...nofityStatus,
            select: 2,
          });
          setDialogState(initialDialog);
        } else {
          setNotify({
            ...notify,
            ...nofityStatus,
            select: 1,
          });
          setDialogState({ ...initialDialog, dialog: true, desktopDeny: true });
        }
      });
    }
    if (notify.permission === 2) {
      setNotify((c) => ({ ...c, select: 1 }));
      setDialogState({ ...initialDialog, dialog: true, desktopDeny: true });
    }
  };

  return dialog.desktopAllow ? (
    <>
      <DialogContent>
        <div className="flex-center">
          <Dvr className="icon" />
          <p>We need your allowance for desktop push notification</p>
        </div>
      </DialogContent>
      <DialogFooter>
        <div className="flex-row">
          <img src={DesktopAllow} alt="desktop allow" width="100%" />
        </div>
        <DialogButton action="dismiss">Cancel</DialogButton>
        <button type="button" onClick={handleClick}>
          OK
        </button>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogNotifySelect;
