const requestNotificationAccess = async (): Promise<NotificationPermission> => {

  try {

    await Notification.requestPermission();
    return Notification.permission;

  } catch (error) {

    console.error(error);
    return Notification.permission;

  };

};

const pushNotification = (title: string, options: NotificationOptions): void => {

  if (Notification.permission !== 'granted') return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notification = new Notification(title, options);

};

export {
  requestNotificationAccess,
  pushNotification
};
