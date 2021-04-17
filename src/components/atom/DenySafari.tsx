import React, { FC } from 'react';
import '@material/react-dialog/dist/dialog.css';
import '../organisms/CounterBoard.css';
import './Deny.css';

const DenyChrom: FC = () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <p>Desktop Notification is denied for this web site.</p>
      <p>Only at Timer start / end, no any other notification</p>
      <p>Please refer to following site , how to change deny to allow.</p>
      <ul className="list">
        <li>
          <a
            href="https://www.lifewire.com/manage-website-push-notifications-in-safari-4103705"
            target="_blank"
            rel="noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://answers.microsoft.com/en-us/edge/forum/edge_issue-edge_win10/turn-on-off-microsoft-edge-pop-up-notifications/1e804ae0-788d-46b0-a414-739231e8eaa3"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
        <li>
          <a
            href="https://sendpulse.com/knowledge-base/push-notifications/enable-disable-push-notifications-mozilla-firefox"
            target="_blank"
            rel="noreferrer"
          >
            FireFox
          </a>
        </li>
        <li>
          <a
            href="https://gravitec.net/blog/how-to-unblock-notifications-on-chrome/"
            target="_blank"
            rel="noreferrer"
          >
            Google Chrome
          </a>
        </li>
      </ul>
    </div>
  );
};

export default DenyChrom;
