import { FC } from 'react';
import { DialogFooter, DialogButton } from '@material/react-dialog';
import '@material/react-dialog/dist/dialog.css';

const SelectNotify: FC = () => {
  return (
    <DialogFooter>
      <DialogButton action="dismiss">Alert</DialogButton>
      <DialogButton action="dismiss">Desktop Notification</DialogButton>
      <DialogButton action="dismiss">
        Desktop Nnotification without timer
      </DialogButton>
    </DialogFooter>
  );
};

export default SelectNotify;
