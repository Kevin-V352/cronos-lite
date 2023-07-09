export const removeNode = (id: number): void => {

  const $taskToRemove = document.getElementById(`${id}`) as HTMLDivElement | null;

  if (!$taskToRemove) return;

  $taskToRemove.parentNode?.removeChild($taskToRemove);

};
