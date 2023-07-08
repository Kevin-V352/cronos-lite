//* Custom Sass
import './sass/app.scss';

//* Images
import personalLogo from './assets/icons/personal-logo.png';

//* Utils
import { elementsGenerators, nodeModifiers, selectors } from './utils';

//* Interfaces
import { type Task } from './interfaces';

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

//* Functions
const getTasksFromLocalStorage = (): { allTasks: Task[], pendingTasks: Task[], completedTasks: Task[] } | null => {

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

const resetCategory = (): void => {

  const previousCategorySelected = document.getElementsByClassName('chip-1--selected')[0] as HTMLSpanElement;
  if (previousCategorySelected) previousCategorySelected.classList.remove('chip-1--selected');

};

const selectTaskCategory = (id: number): void => {

  resetCategory();

  const categorySelected = document.getElementById(`category-${id}`);

  if (!categorySelected) return;

  categorySelected.classList.add('chip-1--selected');

  lastCategorySelected = id;

};

const resetTaskForm = (): void => {

  resetCategory();
  lastCategorySelected = null;
  $createTaskForm?.reset();

};

const openAddTaskModal = (open: boolean): void => {

  if (!$createTaskModal) return;

  if (open) $createTaskModal.showModal();
  else {

    resetTaskForm();
    $createTaskModal.close();

  };

};

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

  const id = Date.now();

  const newTask: Task = {
    id,
    title,
    description,
    date,
    category: lastCategorySelected ?? 6,
    // eslint-disable-next-line key-spacing
    status: 'pending'
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

const completeTask = (id: number): void => {

  if (!$completedTasksList) return;

  nodeModifiers.removeNode(id);

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  const taskToChangeStage = pendingTasks.find((task) => task.id === id);

  if (!taskToChangeStage) return;

  elementsGenerators.renderTaskInList(
    { ...taskToChangeStage, status: 'completed' },
    'completed-tasks-list',
    'completed-tasks-title',
    `Completed - ${(completedTasks.length + 1)}`
  );

  elementsGenerators.renderListTitle('pending-tasks-title', ((pendingTasks.length - 1) > 0) ? `Pending - ${(pendingTasks.length - 1)}` : '');

  updateStageOfTaskInLocalStorage(id);

};

const deleteTask = (id: number): void => {

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { completedTasks } = tasksFromLocaleStorage;

  elementsGenerators.renderListTitle('completed-tasks-title', ((completedTasks.length - 1) > 0) ? `Completed - ${(completedTasks.length - 1)}` : '');
  nodeModifiers.removeNode(id);
  deleteTaskFromLocalStorage(id);

};

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

const deleteTaskFromLocalStorage = (id: number): void => {

  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (!tasksFromLocaleStorage || tasksFromLocaleStorage.length === 0) return;

  const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
  const updatedTasks = parsedTasks.filter(({ id: taskId }) => (taskId !== id));

  localStorage.setItem('tasks', JSON.stringify([...updatedTasks]));

};

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

const getCurrentDate = (): void => {

  if (!$date) return;

  const currentDate = new Date();
  const currentDayNumber = currentDate.getDate();
  const currentDayName = currentDate.toLocaleDateString(undefined, { weekday: 'long' });

  $date.textContent = `${currentDayName} ${currentDayNumber}`;

};

const loadTasks = (): void => {

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage || !$pendingTasksList || !$completedTasksList) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  elementsGenerators.renderListTitle('pending-tasks-title', (pendingTasks.length > 0) ? `Pending - ${pendingTasks.length}` : '');
  if (pendingTasks.length > 0) {

    pendingTasks.forEach((task) => {

      elementsGenerators.renderTaskInList(task, 'pending-tasks-list');

    });

  }

  elementsGenerators.renderListTitle('completed-tasks-title', (completedTasks.length > 0) ? `Completed - ${completedTasks.length}` : '');
  if (completedTasks.length > 0) {

    completedTasks.forEach((task) => {

      elementsGenerators.renderTaskInList(task, 'completed-tasks-list');

    });

  }

};

const initialLoad = (): void => {

  generateWelcomeMessage();
  getCurrentDate();
  loadTasks();
  elementsGenerators.renderCategories('create-task-categories');

  if ($personalLogo) $personalLogo.src = personalLogo;

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
initialLoad();
