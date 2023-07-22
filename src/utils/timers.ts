/** @module utils/timers */

/**
 * Creates a timer that executes a callback when it finishes.
 * @param {(Date | null)} specificDate Date on which the callback is to be triggered.
 * @param {function} cb Callback.
 * @returns {(NodeJS.Timeout | undefined)} Timer ID.
 */
const createTimer = (specificDate: Date | null, cb: () => void): ReturnType<typeof setTimeout> | undefined => {

  if (!specificDate) return;

  const now = new Date();
  const timeLeft = specificDate.getTime() - now.getTime();

  if (timeLeft > 0) return setTimeout(cb, timeLeft);

};

export {
  createTimer
};
