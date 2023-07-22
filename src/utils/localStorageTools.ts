import {
  type Task,
  type LocalStorageTasks,
  type TaskStatus
} from '../interfaces';

/**
 * It gets all tasks stored in the Local storage.
 * @returns {LocalStorageTasks | null} The tasks stored in the Local storage.
 */
const getTasksFromLocalStorage = (): LocalStorageTasks | null => {

  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (!tasksFromLocaleStorage) return null;

  const allTasks: Task[] = JSON.parse(tasksFromLocaleStorage);

  const pendingTasks: Task[] = [];
  const completedTasks: Task[] = [];

  allTasks.forEach((task) => {

    if (task.status === 'pending') pendingTasks.push(task);
    else completedTasks.push(task);

  });

  return {
    allTasks,
    pendingTasks,
    completedTasks
  };

};

/**
 * It stores a task in the Local storage.
 * @param {Task} newTask Task to store.
 */
const saveTaskInLocalStorage = (newTask: Task): void => {

  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (tasksFromLocaleStorage) {

    const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
    const newTasks: Task[] = [...parsedTasks, newTask];

    localStorage.setItem('tasks', JSON.stringify(newTasks));

  } else {

    localStorage.setItem('tasks', JSON.stringify([newTask]));

  };

};

/**
 * It updates the task information in the local storage.
 * @param {number} id Task ID.
 */
const updateStageOfTaskInLocalStorage = (id: number): void => {

  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (!tasksFromLocaleStorage) return;

  const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
  const updatedTasks = parsedTasks.map((task) => {

    if (task.id === id) return { ...task, status: 'completed' };
    else return task;

  });

  localStorage.setItem('tasks', JSON.stringify(updatedTasks));

};

/**
 * It deletes a task from the local storage.
 * @param {number} id Task ID.
 */
const deleteTaskFromLocalStorage = (id: number): void => {

  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (!tasksFromLocaleStorage || tasksFromLocaleStorage.length === 0) return;

  const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
  const updatedTasks = parsedTasks.filter(({ id: taskId }) => (taskId !== id));

  localStorage.setItem('tasks', JSON.stringify([...updatedTasks]));

};

const updateTasksInLocalStorage = (status: TaskStatus, updatedTasks: Task[]): void => {

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  switch (status) {

    case 'pending':
      const { completedTasks } = tasksFromLocaleStorage;

      localStorage.setItem('tasks', JSON.stringify([...completedTasks, ...updatedTasks]));
      break;

    case 'completed':
      const { pendingTasks } = tasksFromLocaleStorage;

      localStorage.setItem('tasks', JSON.stringify([...pendingTasks, ...updatedTasks]));
      break;

    default:
      break;

  };

};

export {
  getTasksFromLocalStorage,
  saveTaskInLocalStorage,
  updateStageOfTaskInLocalStorage,
  deleteTaskFromLocalStorage,
  updateTasksInLocalStorage
};
