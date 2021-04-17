import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState, initialDialog } from 'features/dialog';
import { notifyState } from 'features/counter';
import { DialogContent, DialogFooter } from '@material/react-dialog';
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
        <div className="flex-center m-0">
          <Dvr className="icon" />
          We need your allowance for desktop push notification
        </div>
        <div className="flex-center m-0">
          デスクトップ通知の許可が必要です。
        </div>
        <div className="flex-row">
          <img src={DesktopAllow} alt="desktop allow" width="100%" />
        </div>
        <div className="flex-row" style={{ marginTop: 10 }}>
          Please click OK and allow desktop notification, only at Timer start /
          end, no any other notification
        </div>
      </DialogContent>
      <DialogFooter>
        <button
          type="button"
          onClick={handleClick}
          style={{
            border: 'solid 1px #ccc',
            margin: 'auto',
            borderRadius: '30px',
            backgroundColor: '#ff1744',
            color: '#fff',
            padding: '10px 20px',
          }}
          className="ripple"
        >
          OK
        </button>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogNotifySelect;
