import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState, initialDialog } from 'features/dialog';
import { notifyState } from 'features/counter';
import {
  DialogContent,
  DialogFooter,
  DialogButton,
} from '@material/react-dialog';
import '@material/react-dialog/dist/dialog.css';
import Alert from 'images/alert.png';
import Desktop from 'images/desktop.png';
import { ReactComponent as Campaign } from 'images/campaign.svg';
import { ReactComponent as Dvr } from 'images/dvr.svg';
import './Dialog.css';
import '../organisms/CounterBoard.css';
import { ReactComponent as Notification } from 'images/notifications.svg';
import { ReactComponent as DoNot } from 'images/do_not_disturb.svg';
import { useCookies } from 'react-cookie';

// import SelectNotify from 'components/atom/SelectNotify';

const DialogInitial: FC = () => {
  const [dialog, setDialogState] = useRecoilState(dialogState);
  const [notify, setNotify] = useRecoilState(notifyState);
  const [_, setCookie] = useCookies(['notify']);

  const handleClick = (select: number) => {
    if (select === 1) {
      setNotify((c) => ({ ...c, select: 1 }));
      setDialogState({ ...initialDialog, dialog: true, notifySelect: true });
    }
    if (select === 2 && notify.browser === 3) {
      setNotify((c) => ({ ...c, select: 2 }));
      setDialogState({ ...initialDialog, dialog: true, notifySelect: true });
    }
    if (select === 2 && notify.browser === 2) {
      setNotify((c) => ({ ...c, select: 2, cycle: 1 }));
      if (!notify.permission) {
        setDialogState({ ...initialDialog, dialog: true, desktopAllow: true });
      } else {
        setDialogState(initialDialog);
      }
    }
    if (select === 4) {
      setDialogState(initialDialog);
      setNotify({ ...notify, cycle: 1, select: 4 });
    }
    setCookie('notify', notify);
  };

  return dialog.initial ? (
    <>
      <DialogContent>
        <div className="flex-center" style={{ margin: 0 }}>
          <Notification className="icon" fill="#ff1744" />
          <p style={{ margin: 0 }}>Please select a notification method</p>
        </div>
        <div className="flex-center" style={{ margin: 0 }}>
          <p style={{ margin: 0, fontSize: 14 }}>通知方法を選択してください</p>
        </div>
      </DialogContent>
      <DialogFooter>
        {notify.support ? (
          <button
            type="button"
            className="border flex-row"
            onClick={() => handleClick(2)}
          >
            <div className="flex-center">
              <Dvr className="icon" />
              <p className="m-0">Desktop Notification</p>
            </div>
            <img src={Desktop} alt="desktop notification" width="250px" />
          </button>
        ) : (
          <></>
        )}

        <button
          type="button"
          className="border flex-row"
          onClick={() => handleClick(1)}
        >
          <div className="flex-center">
            <Campaign className="icon" />
            <p className="m-0">Window Alert</p>
          </div>
          <img src={Alert} alt="alert notification" width="250px" />
        </button>
        <button
          type="button"
          className="border flex-row"
          onClick={() => handleClick(4)}
        >
          <div className="flex-center">
            <DoNot className="icon" />
            <p className="m-0">No Notification</p>
          </div>
        </button>
        <DialogButton action="dismiss">Cancel</DialogButton>
      </DialogFooter>
    </>
  ) : (
    <></>
  );
};

export default DialogInitial;
