// https://developer.mozilla.org/ja/docs/Web/API/Notifications_API/Using_the_Notifications_API

const askNotificationSupport = () => {
  if ('Notification' in window) return true;

  return false;
};

export const handlePermission = (): number => {
  if (Notification.permission === 'default') {
    return 0;
  }
  if (Notification.permission === 'granted') {
    return 1;
  }
  if (Notification.permission === 'denied') {
    return 2;
  }

  return 0;
};

// https://arts-factory.net/useragentbrowser/
const browser = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
    // IE向けの記述
    return 1;
  }

  if (userAgent.indexOf('edge') !== -1) {
    return 2;
  }

  if (userAgent.indexOf('chrome') !== -1) {
    return 3;
  }

  if (
    userAgent.indexOf('safari') !== -1 ||
    userAgent.indexOf('firefox') !== -1
  ) {
    // Safari向けの記述 FireFox向けの記述
    return 2;
  }

  // その他のブラウザ向けの記述
  return 1;
};

const notificationVerify = (): {
  support: boolean;
  permission: number;
  browser: number;
} => {
  const support = askNotificationSupport();

  return {
    support,
    permission: support ? handlePermission() : 0,
    browser: browser(),
  };
};

export default notificationVerify;
