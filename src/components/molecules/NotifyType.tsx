import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { dialogState } from 'features/dialog';
import { notifyState } from 'features/counter';

import { ReactComponent as Notification } from 'images/settings.svg';
import { ReactComponent as Click } from 'images/click.svg';
import { ReactComponent as Timer } from 'images/timer.svg';
import { ReactComponent as DoNot } from 'images/do_not_disturb.svg';
import { ReactComponent as Campaign } from 'images/campaign.svg';
import { ReactComponent as Dvr } from 'images/dvr.svg';

import '../organisms/CounterBoard.css';
import './Dialog.css';

const NotifyType: FC = () => {
  const [dialog, setDialogState] = useRecoilState(dialogState);
  const [notify, _setNotify] = useRecoilState(notifyState);

  return (
    <div className="flex-center" style={{ marginTop: 10 }}>
      <div className="flex-center">
        <button
          className="flex-center ripple"
          style={{
            padding: 6,
            borderRadius: 30,
          }}
          type="button"
          onClick={() =>
            setDialogState({ ...dialog, dialog: true, initial: true })
          }
        >
          <Notification fill="#00000099" />
          <div
            className="setting flex-center"
            style={{ marginLeft: 0, border: 'none' }}
          >
            {notify.select === 4 && <DoNot />}
            {notify.select === 1 && <Campaign />}
            {notify.select === 2 && <Dvr />}
            {notify.cycle === 1 && <Timer />}
            {notify.cycle === 2 && <Click />}
          </div>
        </button>
      </div>
    </div>
  );
};

export default NotifyType;
