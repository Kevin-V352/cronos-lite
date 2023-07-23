import pageFavicon from '../assets/icons/favicon.ico';
import notificationSound from '../assets/sounds/playful-notification.ogg';

/** @module utils/notifications */

/**
 * It requests the user's permission to display notifications on their device.
 * @async
 */
const requestNotificationAccess = async (alertUser: boolean): Promise<void> => {

  try {

    await Notification.requestPermission();

  } catch (error) {

    console.error(error);

  };

  if (Notification.permission === 'granted' && alertUser) {

    try {

      await pushNotification('CRONOS LITE', {
        body: 'Example of notification. 🔔',
        icon: pageFavicon,
        lang: 'en'
      });

    } catch (error) {

      console.error(error);

    };

  };

};

/**
 * It triggers a notification on the user's device.
 * @param {string} title Notification title.
 * @param {NotificationOptions} options Notification options.
 */
const pushNotification = async (title: string, options: NotificationOptions): Promise<void> => {

  if (Notification.permission !== 'granted') return;

  let audioEnabled: boolean = true;
  const notificationAudio = new Audio(notificationSound);

  try {

    await notificationAudio.play();

  } catch (error) {

    console.error(error);
    audioEnabled = false;

  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notification = new Notification(title, { ...options, silent: audioEnabled });

};

export {
  requestNotificationAccess,
  pushNotification
};
