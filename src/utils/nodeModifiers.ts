/** @module utils/nodeModifiers */

/**
 * It removes the element from the DOM.
 * @param {number} id Node ID to remove.
 */
const removeNode = (id: number): void => {

  const $taskToRemove = document.getElementById(`${id}`) as HTMLDivElement | null;

  if (!$taskToRemove) return;

  $taskToRemove.parentNode?.removeChild($taskToRemove);

};

export {
  removeNode
};
