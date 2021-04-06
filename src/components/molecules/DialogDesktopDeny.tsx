import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState } from 'features/dialog';
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

const DialogDesktopDeny: FC = () => {
  const [dialog, _setDialogState] = useRecoilState(dialogState);

  return dialog.desktopDeny ? (
    <>
      <DialogContent>
        <div className="flex-center">
          <Dvr className="icon" />
          <p>Desktop push notification is denied</p>
        </div>
      </DialogContent>
      <DialogFooter>
        Please select information mark for reset nofication allowance.
        <div className="flex-row">
          <img src={DesktopAllow} alt="desktop allow" width="100%" />
        </div>
        <DialogButton action="dismiss">Cancel</DialogButton>
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
