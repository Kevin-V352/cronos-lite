//* Third-party libraries
import flatpickr from 'flatpickr';
import AOS from 'aos';

//* Custom Css
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/dark.css';
import 'aos/dist/aos.css';

//* Custom Sass
import './sass/app.scss';

//* Images
import personalLogo from './assets/icons/personal-logo.png';
import pageFavicon from './assets/icons/favicon.ico';

//* Utils
import {
  elementsGenerators,
  nodeModifiers,
  notifications,
  selectors,
  timers
} from './utils';

//* Interfaces
import {
  type TaskStatus,
  type LocalStorageTasks,
  type Task
} from './interfaces';

//* Elements
const $date = selectors.byId('date') as HTMLTitleElement | null;
const $greetings = selectors.byId('greetings') as HTMLTitleElement | null;
const $createTaskModal = selectors.byId('create-task-modal') as HTMLDialogElement | null;
const $pendingTasksList = selectors.byId('pending-tasks-list') as HTMLDivElement | null;
const $completedTasksList = selectors.byId('completed-tasks-list') as HTMLDivElement | null;
const $createTaskForm = selectors.byId('create-task-form') as HTMLFormElement | null;
const $personalLogo = selectors.byId('personal-logo') as HTMLImageElement | null;

//* Variables
let lastCategorySelected: number | null = null;
let lastSelectedDate: Date | null = null;

//* Functions

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
 * It resets the selected category.
 */
const resetCategory = (): void => {

  const previousCategorySelected = document.getElementsByClassName('chip-1--selected')[0] as HTMLSpanElement;
  if (previousCategorySelected) previousCategorySelected.classList.remove('chip-1--selected');

};

/**
 * It selects a category and displays it in the UI.
 * @param {number} id Category ID.
 */
const selectTaskCategory = (id: number): void => {

  resetCategory();

  const categorySelected = document.getElementById(`category-${id}`);

  if (!categorySelected) return;

  categorySelected.classList.add('chip-1--selected');

  lastCategorySelected = id;

};

/**
 * It resets all form values.
 */
const resetTaskForm = (): void => {

  resetCategory();
  lastCategorySelected = null;
  $createTaskForm?.reset();

};

/**
 * It opens the form for adding a new task.
 * @param {boolean} open Opening status.
 */
const openAddTaskModal = (open: boolean): void => {

  if (!$createTaskModal) return;

  if (open) $createTaskModal.showModal();
  else {

    resetTaskForm();
    $createTaskModal.close();

  };

};

/**
 * It extracts the values from the form and creates a new pending task.
 * @param {FormDataEvent} e Form values.
 */
const createTask = (e: FormDataEvent): void => {

  e.preventDefault();
  if (!$pendingTasksList) return;

  const formData = new FormData(e.target as HTMLFormElement);

  const title = formData.get('create-task-title-input') as string;
  const description = formData.get('create-task-description-textarea') as string;
  const date = formData.get('create-task-input-date') as string;

  const fieldsArr = Object.entries({ title, description, date });

  const emptyFields: string[] = [];

  fieldsArr.forEach(([field, value]) => {

    if (!(value && value.trim() !== '')) emptyFields.push((field.charAt(0).toUpperCase() + field.slice(1)));

  });

  if (emptyFields.length > 0) {

    alert(`The following fields are required: ${emptyFields.join(', ')}.`);
    return;

  };

  const timeOutId = timers.createTimer(lastSelectedDate, () => {

    notifications.pushNotification(title, {
      body: description,
      icon: pageFavicon,
      lang: 'en'
    });

  });

  const id = Date.now();

  const newTask: Task = {
    id,
    title,
    description,
    date,
    dateObj:  lastSelectedDate,
    category: lastCategorySelected ?? 6,
    status:   'pending',
    timeOutId
  };

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  saveTaskInLocalStorage(newTask);
  elementsGenerators.renderTaskInList(
    newTask,
    'pending-tasks-list',
    'pending-tasks-title',
    `Pending - ${(tasksFromLocaleStorage && tasksFromLocaleStorage.pendingTasks.length > 0) ? (tasksFromLocaleStorage.pendingTasks.length + 1) : 1}`
  );

  resetTaskForm();
  openAddTaskModal(false);

};

/**
 * It marks a task as complete and moves it to the list of completed tasks in the UI.
 * @param {number} id Task ID.
 */
const completeTask = (id: number): void => {

  if (!$completedTasksList) return;

  nodeModifiers.removeNode(id);

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  const taskToChangeStage = pendingTasks.find((task) => task.id === id);

  if (!taskToChangeStage) return;

  clearTimeout(taskToChangeStage.timeOutId);

  elementsGenerators.renderTaskInList(
    { ...taskToChangeStage, status: 'completed' },
    'completed-tasks-list',
    'completed-tasks-title',
    `Completed - ${(completedTasks.length + 1)}`
  );

  elementsGenerators.renderListTitle('pending-tasks-title', ((pendingTasks.length - 1) > 0) ? `Pending - ${(pendingTasks.length - 1)}` : '');

  updateStageOfTaskInLocalStorage(id);

};

/**
 * It deletes a task from the list of completed tasks.
 * @param {number} id Task ID.
 */
const deleteTask = (id: number): void => {

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { completedTasks } = tasksFromLocaleStorage;

  elementsGenerators.renderListTitle('completed-tasks-title', ((completedTasks.length - 1) > 0) ? `Completed - ${(completedTasks.length - 1)}` : '');
  nodeModifiers.removeNode(id);
  deleteTaskFromLocalStorage(id);

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

  }

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

/**
 * It generates a welcome message in the UI when loading the web.
 */
const generateWelcomeMessage = (): void => {

  if (!$greetings) return;

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let greetings = '';

  if (currentHour >= 6 && currentHour < 12) greetings = 'Good morning, have a nice day!';
  else if (currentHour >= 12 && currentHour < 19) greetings = 'Good afternoon, I hope you are having a good day!';
  else if (currentHour >= 19 && currentHour < 24) greetings = 'Good evening, I hope you have a good one!';
  else greetings = 'Hi, web surfing into late hours?';

  $greetings.textContent = greetings;

};

/**
 * It gets the current date (according to the client's browser) and displays it in the UI.
 */
const getCurrentDate = (): void => {

  if (!$date) return;

  const currentDate = new Date();
  const currentDayNumber = currentDate.getDate();
  const currentDayName = currentDate.toLocaleDateString(undefined, { weekday: 'long' });

  $date.textContent = `${currentDayName} ${currentDayNumber}`;

};

/**
 * It loads the tasks in the UI when loading the web.
 */
const loadTasks = (): void => {

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage || !$pendingTasksList || !$completedTasksList) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  elementsGenerators.renderListTitle(
    'pending-tasks-title',
    (pendingTasks.length > 0) ? `Pending - ${pendingTasks.length}` : ''
  );

  //* PENDING TASKS

  if (pendingTasks.length > 0) {

    const updatedPendingTasks = pendingTasks.map((task) => {

      elementsGenerators.renderTaskInList(task, 'pending-tasks-list');

      const { title, description, dateObj } = task;

      if (!dateObj) return task;

      const newTimeOutId = timers.createTimer(new Date(dateObj), () => {

        notifications.pushNotification(title, {
          body: description,
          icon: pageFavicon,
          lang: 'en'
        });

      });

      return {
        ...task,
        timeOutId: newTimeOutId
      };

    });

    updateTasksInLocalStorage('pending', updatedPendingTasks);

  };

  //* COMPLETED TASKS

  elementsGenerators.renderListTitle(
    'completed-tasks-title',
    (completedTasks.length > 0) ? `Completed - ${completedTasks.length}` : ''
  );

  if (completedTasks.length > 0) {

    completedTasks.forEach((task) => {

      elementsGenerators.renderTaskInList(task, 'completed-tasks-list');

    });

  };

};

/**
 * It executes all the functions and libraries necessary for the operation of the web.
 */
const initialLoad = async (): Promise<void> => {

  generateWelcomeMessage();
  getCurrentDate();
  loadTasks();
  elementsGenerators.renderCategories('create-task-categories');

  AOS.init();

  const curretTime = new Date();

  flatpickr('#create-task-input-date', {
    enableTime:      true,
    dateFormat:      'Y-m-d h:i K',
    static:          true,
    minDate:         'today',
    minTime:         `${curretTime.getHours()}`,
    minuteIncrement: 1,
    onChange:        (dates) => {

      lastSelectedDate = dates[0];

    }
  });

  if ($personalLogo) $personalLogo.src = personalLogo;

  if (Notification.permission !== 'granted') await notifications.requestNotificationAccess();

};

// @ts-expect-error -->
window.openAddTaskModal = openAddTaskModal;

// @ts-expect-error -->
window.selectTaskCategory = selectTaskCategory;

// @ts-expect-error -->
window.createTask = createTask;

// @ts-expect-error -->
window.completeTask = completeTask;

// @ts-expect-error -->
window.deleteTask = deleteTask;

//* Initial load
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initialLoad();
