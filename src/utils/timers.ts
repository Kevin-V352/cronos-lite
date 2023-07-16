const createTimer = (specificDate: Date | null, cb: () => void): ReturnType<typeof setTimeout> | undefined => {

  if (!specificDate) return;

  const now = new Date();
  const timeLeft = specificDate.getTime() - now.getTime();

  if (timeLeft > 0) return setTimeout(cb, timeLeft);

};

export {
  createTimer
};
