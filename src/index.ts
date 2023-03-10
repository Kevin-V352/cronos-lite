//* Interfacesgreetings
interface Task {
  id: number;
  title: string;
  description?: string;
  category: number;
  date: string;
  status: 'pending' | 'completed';
}

//* CustomSelectors
const byId = (id: string) => document.getElementById(id);

//* Elements
const $date = byId('date') as HTMLTitleElement | null;
const $greetings = byId('greetings') as HTMLTitleElement | null;
const $addTaskButton = byId('add-task-button') as HTMLButtonElement | null;
const $createTaskModal = byId('create-task-modal') as HTMLDialogElement | null;
const $addTaskCategories = byId('create-task-categories') as HTMLDivElement | null;
const $pendingTasksList = byId('pending-tasks-list') as HTMLDivElement | null;
const $completedTasksList = byId('completed-tasks-list') as HTMLDivElement | null;
const $createTaskForm = byId('create-task-form') as HTMLFormElement | null;

//* Constants
const categories: { [key: number]: { icon: string, name: string } } = {
  1: { icon: 'fa-solid fa-utensils', name: 'Food' },
  2: { icon: 'fa-solid fa-dumbbell', name: 'Workout' },
  3: { icon: 'fa-solid fa-briefcase', name: 'Work' },
  4: { icon: 'fa-solid fa-pen-nib', name: 'Desing' },
  5: { icon: 'fa-solid fa-person-running', name: 'Run' },
  6: { icon: 'fa-solid fa-note-sticky', name: 'Various' },
  7: { icon: 'fa-solid fa-book', name: 'Study' },
  8: { icon: 'fa-solid fa-school', name: 'Classes' },
  9: { icon: 'fa-solid fa-bag-shopping', name: 'Shop' }, 
  10: { icon: 'fa-solid fa-prescription-bottle-medical', name: 'Medicine' },
  11: { icon: 'fa-solid fa-moon', name: 'Sleep' }
}

let lastCategorySelected: number | null = null;

//* Functions
const getTasksFromLocalStorage = (): { allTasks: Task[], pendingTasks: Task[], completedTasks: Task[] } | null => {
  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (!tasksFromLocaleStorage) return null;

  const allTasks: Task[] = JSON.parse(tasksFromLocaleStorage);

  let pendingTasks: Task[] = [];
  let completedTasks: Task[] = [];

  allTasks.forEach((task) => {
    if(task.status === 'pending') pendingTasks.push(task);
    else completedTasks.push(task);
  });

  return {
    allTasks,
    pendingTasks,
    completedTasks
  };

};

const renderTaskInList = (
  task: Task, 
  parentNode: HTMLDivElement, 
  listTitleId?: 'pending-tasks-title' | 'completed-tasks-title', 
  listTitleValue?: string
): void => {

  const { id, title, description, date, category, status } = task;
  const icon = categories[category].icon;
  const isPending = (status === 'pending');

  const newNode = `
    <div class="card-1__container" id="${id}" data-aos="fade-down">
      <button 
        class="${isPending ? 'icon-button--check' : 'icon-button--delete'}" 
        onclick="${isPending ? `completeTask(${id})` : `deleteTask(${id})`}"
      >
        <i class="fa-solid ${isPending ? 'fa-check' : 'fa-x'}"></i>
      </button>
      <div class="card-1__content">
        <span class="card-1__icon card-1__icon--color-${category}">
          <i class="${icon}"></i>
        </span>
        <h4 class="card-1__title ${!isPending && 'card-1__title--strikethrough'}">${title}</h4>
        <p class="card-1__description ${!isPending && 'card-1__title--strikethrough'}">${description}</p>
        <span class="card-1__date">${date}</span>
      </div>
    </div>
  `;

  parentNode.insertAdjacentHTML('afterbegin', newNode);

  if (listTitleId && listTitleValue !== undefined) updateListTitle(listTitleId, listTitleValue);

};

const removeNode = (id: number) => {
  const $taskToRemove = document.getElementById(`${id}`) as HTMLDivElement | null;
  if (!$taskToRemove) return;
  $taskToRemove.parentNode?.removeChild($taskToRemove);
};

const resetCategory = () => {
  const previousCategorySelected = document.getElementsByClassName('chip-1--selected')[0] as HTMLSpanElement;
  if (previousCategorySelected) previousCategorySelected.classList.remove('chip-1--selected');
};

const updateListTitle = (listTitleId: 'pending-tasks-title' | 'completed-tasks-title', value: string) => {
  const $listTitle = document.getElementById(listTitleId) as HTMLTitleElement;

  if(!$listTitle) return;

  $listTitle.textContent = value;
};

const selectTaskCategory = (id: number) => {
  resetCategory();

  const categorySelected = document.getElementById(`category-${id}`);

  if (!categorySelected) return;

  categorySelected.classList.add('chip-1--selected');

  lastCategorySelected = id;
};

const resetTaskForm = () => {
  resetCategory();
  lastCategorySelected = null;
  $createTaskForm?.reset();
};

const openAddTaskModal = (open: boolean) => {
  if (!$createTaskModal) return;

  if (open) $createTaskModal.showModal();
  else {
    resetTaskForm();
    $createTaskModal.close();
  }
};

const createTask = (e: FormDataEvent) => {
  e.preventDefault();
  if (!$pendingTasksList) return;

  const formData = new FormData(e.target as HTMLFormElement);

  const title = formData.get('create-task-title-input') as string;
  const description = formData.get('create-task-description-textarea') as string;
  const date = formData.get('create-task-input-date') as string;

  const fieldsArr = Object.entries({ title, description, date });
  
  let emptyFields: string[] = [];

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
    status: 'pending' 
  };

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  saveTaskInLocalStorage(newTask);
  renderTaskInList(
    newTask, 
    $pendingTasksList, 
    'pending-tasks-title',
    `Pending - ${(tasksFromLocaleStorage && tasksFromLocaleStorage.pendingTasks.length > 0) ? (tasksFromLocaleStorage.pendingTasks.length + 1) : 1}` 
  );

  resetTaskForm();
  openAddTaskModal(false);
};

const completeTask = (id: number) => {
  if (!$completedTasksList) return;

  removeNode(id);

  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  const taskToChangeStage = pendingTasks.find((task) => task.id === id);

  if (!taskToChangeStage) return;

  renderTaskInList(
    {...taskToChangeStage, status: 'completed'}, 
    $completedTasksList, 
    'completed-tasks-title',
    `Completed - ${(completedTasks.length + 1)}`,  
  );

  updateListTitle('pending-tasks-title', ((pendingTasks.length - 1) > 0) ? `Pending - ${(pendingTasks.length - 1)}` : '');

  updateStageofTaskInLocalStorage(id);
};

const deleteTask = (id: number) => {
  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage) return;

  const { completedTasks } = tasksFromLocaleStorage;

  updateListTitle('completed-tasks-title', ((completedTasks.length - 1) > 0) ? `Completed - ${(completedTasks.length - 1)}` : '');
  removeNode(id);
  deleteTaskFromLocalStorage(id);
};

const saveTaskInLocalStorage = (newTask: Task) => {
  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if (tasksFromLocaleStorage) {
    const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
    const newTasks: Task[] = [...parsedTasks, newTask];

    localStorage.setItem('tasks', JSON.stringify(newTasks));
  } else {
    localStorage.setItem('tasks', JSON.stringify([newTask]));
  }
};

const updateStageofTaskInLocalStorage = (id: number) => {
  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if(!tasksFromLocaleStorage) return;

  const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
  const updatedTasks = parsedTasks.map((task) => {
    if (task.id === id) return { ...task, status: 'completed' };
    else return task;
  })

  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
};

const deleteTaskFromLocalStorage = (id: number) => {
  const tasksFromLocaleStorage = localStorage.getItem('tasks');

  if(!tasksFromLocaleStorage || tasksFromLocaleStorage.length === 0) return;

  const parsedTasks: Task[] = JSON.parse(tasksFromLocaleStorage);
  const updatedTasks = parsedTasks.filter(({ id: taskId }) => (taskId !== id));

  localStorage.setItem('tasks', JSON.stringify([...updatedTasks]));

};

const generateWelcomeMessage = () => {
  if (!$greetings) return;

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let greetings = '';

  if(currentHour >= 6 && currentHour < 12) greetings = 'Good morning, have a nice day!';
  else if (currentHour >= 12 && currentHour < 19) greetings = 'Good afternoon, I hope you are having a good day!';
  else if (currentHour >= 19 && currentHour < 24) greetings = 'Good evening, I hope you have a good one!'
  else greetings = 'Hi, web surfing into late hours?'

  $greetings.textContent = greetings;
};

const getCurrentDate = () => {
  if (!$date) return;

  const currentDate = new Date();
  const currentDayNumber = currentDate.getDate();
  const currentDayName = currentDate.toLocaleDateString(undefined, { weekday: 'long' });

  $date.textContent = `${currentDayName} ${currentDayNumber}`;
};

const loadCategories = () => {
  if (!$addTaskCategories) return;

  for (const categoryKey in categories) {
    $addTaskCategories.innerHTML += `
      <span 
        class="chip-1 chip-1--color-${categoryKey}" 
        onclick="selectTaskCategory(${categoryKey})"
        id="category-${categoryKey}"
      >
        ${categories[categoryKey].name}
      </span>`;
  };
};

const initialLoadOfTasks = () => {
  const tasksFromLocaleStorage = getTasksFromLocalStorage();

  if (!tasksFromLocaleStorage || !$pendingTasksList || !$completedTasksList) return;

  const { pendingTasks, completedTasks } = tasksFromLocaleStorage;

  updateListTitle('pending-tasks-title', (pendingTasks.length > 0) ? `Pending - ${pendingTasks.length}` : '');
  if(pendingTasks.length > 0) pendingTasks.forEach((task) => renderTaskInList(task, $pendingTasksList));

  updateListTitle('completed-tasks-title', (completedTasks.length > 0) ? `Completed - ${completedTasks.length}` : '');
  if(completedTasks.length > 0) completedTasks.forEach((task) => renderTaskInList(task, $completedTasksList));
  
};

//* Events listeners
$addTaskButton?.addEventListener('click', () => openAddTaskModal(true));

//* Initial load
generateWelcomeMessage();
getCurrentDate();
loadCategories();
initialLoadOfTasks();

