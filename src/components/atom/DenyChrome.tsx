import React, { FC } from 'react';
import '@material/react-dialog/dist/dialog.css';
import DesktopAllow from 'images/reset.png';
import '../organisms/CounterBoard.css';

const DenyChrome: FC = () => {
  return (
    <>
      <p>
        Please select information mark for reset nofication allowance. Please
        refer to{' '}
        <a
          href="https://gravitec.net/blog/how-to-unblock-notifications-on-chrome/"
          target="_blank"
          rel="noreferrer"
        >
          this web site
        </a>
        , how to change deny to allow.{' '}
      </p>
      <p>If you will not change this setting, it will be notified by alert.</p>
      <p>
        デスクトップ通知を許可に変更してください。変更されない場合はアラートで通知されます。
      </p>

      <div className="flex-row" style={{ maxWidth: 350, margin: 'auto' }}>
        <img src={DesktopAllow} alt="desktop allow" width="100%" />
      </div>
    </>
  );
};

export default DenyChrome;
