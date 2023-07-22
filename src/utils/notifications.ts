/** @module utils/notifications */

/**
 * It requests the user's permission to display notifications on their device.
 * @async
 * @returns {('granted' | 'default' | 'denied')} User permission status.
 */
const requestNotificationAccess = async (): Promise<NotificationPermission> => {

  try {

    await Notification.requestPermission();

  } catch (error) {

    console.error(error);

  };

  return Notification.permission;

};

/**
 * It triggers a notification on the user's device.
 * @param {string} title Notification title.
 * @param {NotificationOptions} options Notification options.
 */
const pushNotification = (title: string, options: NotificationOptions): void => {

  if (Notification.permission !== 'granted') return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notification = new Notification(title, options);

};

export {
  requestNotificationAccess,
  pushNotification
};
