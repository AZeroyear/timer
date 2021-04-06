import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState, initialDialog } from 'features/dialog';
import Dialog from '@material/react-dialog';
import '@material/react-dialog/dist/dialog.css';
import './Dialog.css';
import '../organisms/CounterBoard.css';
import DialogInitial from 'components/molecules/DialogInitial';
import DialogCycleSelect from 'components/molecules/DialogCycleSelect';
import DialogDesktopAllow from 'components/molecules/DialogDesktopAllow';
import DialogDesktopDeny from 'components/molecules/DialogDesktopDeny';
// import SelectNotify from 'components/atom/SelectNotify';

const DialogForm: FC = () => {
  const [dialog, setDialogState] = useRecoilState(dialogState);

  return (
    <Dialog onClose={() => setDialogState(initialDialog)} open={dialog.dialog}>
      <DialogInitial />
      <DialogCycleSelect />
      <DialogDesktopAllow />
      <DialogDesktopDeny />
    </Dialog>
  );
};

export default DialogForm;
