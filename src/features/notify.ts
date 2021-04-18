/* eslint-disable import/prefer-default-export */
/* eslint-disable no-alert */

export const notifyAlert = (timeType: number): void => {
  const sentence = timeType === 0 ? 'Relax and Strech' : 'Concentrate';
  alert(sentence);
};

export const notifyDesktop = (
  timeType: number,
  cycle?: number,
  callback?: () => void,
): void => {
  const sentence = timeType === 0 ? 'Relax and Strech' : 'Concentrate';
  const interaction = timeType === 0 && cycle === 2;
  const icon = `${process.env.PUBLIC_URL}/${
    timeType === 0 ? 'strech.png' : 'concentrate.png'
  }`;

  const options = {
    body: 'Pomodoro Health Timer',
    requireInteraction: interaction,
    icon,
  };

  const notification = new Notification(sentence, options);
  if (callback) notification.onclose = () => callback();
};
