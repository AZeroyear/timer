/* eslint-disable import/prefer-default-export */
import { handlePermission } from './notificationVerify';

const checkNotificationPromise = () => {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
};

export const desktopNotifyPermission = (callFC: () => void): number => {
  let permissionStatus = 0;
  if (checkNotificationPromise()) {
    Notification.requestPermission().then((_) => {
      permissionStatus = handlePermission();
      callFC();
    });
  } else {
    Notification.requestPermission((_) => {
      permissionStatus = handlePermission();
      callFC();
    });
  }

  return permissionStatus;
};
