"use strict";
//* CustomSelectors
const byId = (id) => document.getElementById(id);
//* Elements
const $date = byId('date');
const $greetings = byId('greetings');
const $addTaskButton = byId('add-task-button');
const $createTaskModal = byId('create-task-modal');
const $addTaskCategories = byId('create-task-categories');
const $pendingTasksList = byId('pending-tasks-list');
const $completedTasksList = byId('completed-tasks-list');
const $createTaskForm = byId('create-task-form');
//* Constants
const categories = {
    1: { icon: 'fa-solid fa-utensils', name: 'Food' },
    2: { icon: 'fa-solid fa-dumbbell', name: 'Workout' },
    3: { icon: 'fa-solid fa-briefcase', name: 'Work' },
    4: { icon: 'fa-solid fa-pen-nib', name: 'Desing' },
    5: { icon: 'fa-solid fa-person-running', name: 'Run' },
    6: { icon: 'fa-solid fa-note-sticky', name: 'Various' },
};
let lastCategorySelected = null;
//* Functions
const getTasksFromLocalStorage = () => {
    const tasksFromLocaleStorage = localStorage.getItem('tasks');
    if (!tasksFromLocaleStorage)
        return null;
    const allTasks = JSON.parse(tasksFromLocaleStorage);
    let pendingTasks = [];
    let completedTasks = [];
    allTasks.forEach((task) => {
        if (task.status === 'pending')
            pendingTasks.push(task);
        else
            completedTasks.push(task);
    });
    return {
        allTasks,
        pendingTasks,
        completedTasks
    };
};
const renderTaskInList = (task, parentNode, listTitleId, listTitleValue) => {
    const { id, title, description, date, category, status } = task;
    const icon = categories[category].icon;
    const isPending = (status === 'pending');
    const newNode = `
    <div class="card1__container" id="${id}" data-aos="fade-down">
      <button 
        class="${isPending ? 'icon-button--check' : 'icon-button--delete'}" 
        onclick="${isPending ? `completeTask(${id})` : `deleteTask(${id})`}"
      >
        <i class="fa-solid ${isPending ? 'fa-check' : 'fa-x'}"></i>
      </button>
      <div class="card1__content">
        <span class="card1__icon card1__icon--color-${category}">
          <i class="${icon}"></i>
        </span>
        <h4 class="card1__title ${!isPending && 'card1__title--strikethrough'}">${title}</h4>
        <p class="card1__description ${!isPending && 'card1__title--strikethrough'}">${description}</p>
        <span class="card1__date">${date}</span>
      </div>
    </div>
  `;
    parentNode.insertAdjacentHTML('afterbegin', newNode);
    if (listTitleId && listTitleValue !== undefined)
        updateListTitle(listTitleId, listTitleValue);
};
const removeNode = (id) => {
    const $taskToRemove = document.getElementById(`${id}`);
    if (!$taskToRemove)
        return;
    $taskToRemove.parentNode?.removeChild($taskToRemove);
};
const resetCategory = () => {
    const previousCategorySelected = document.getElementsByClassName('chip1--selected')[0];
    if (previousCategorySelected)
        previousCategorySelected.classList.remove('chip1--selected');
};
const updateListTitle = (listTitleId, value) => {
    const $listTitle = document.getElementById(listTitleId);
    if (!$listTitle)
        return;
    $listTitle.textContent = value;
};
const openAddTaskModal = (open) => {
    if (!$createTaskModal)
        return;
    if (open)
        $createTaskModal.showModal();
    else
        $createTaskModal.close();
};
const selectTaskCategory = (id) => {
    resetCategory();
    const categorySelected = document.getElementById(`category-${id}`);
    if (!categorySelected)
        return;
    categorySelected.classList.add('chip1--selected');
    lastCategorySelected = id;
};
const createTask = (e) => {
    e.preventDefault();
    if (!$pendingTasksList)
        return;
    const formData = new FormData(e.target);
    const title = formData.get('create-task-title-input');
    const description = formData.get('create-task-description-textarea');
    const date = formData.get('create-task-input-date');
    const fieldsArr = Object.entries({ title, description, date });
    let emptyFields = [];
    fieldsArr.forEach(([field, value]) => {
        if (!(value && value.trim() !== ''))
            emptyFields.push((field.charAt(0).toUpperCase() + field.slice(1)));
    });
    if (emptyFields.length > 0) {
        alert(`The following fields are required: ${emptyFields.join(', ')}.`);
        return;
    }
    ;
    const id = Date.now();
    const newTask = {
        id,
        title,
        description,
        date,
        category: lastCategorySelected ?? 6,
        status: 'pending'
    };
    const tasksFromLocaleStorage = getTasksFromLocalStorage();
    saveTaskInLocalStorage(newTask);
    renderTaskInList(newTask, $pendingTasksList, 'pending-tasks-title', `Pending - ${(tasksFromLocaleStorage && tasksFromLocaleStorage.pendingTasks.length > 0) ? (tasksFromLocaleStorage.pendingTasks.length + 1) : 1}`);
    lastCategorySelected = null;
    $createTaskForm?.reset();
    resetCategory();
    openAddTaskModal(false);
};
const completeTask = (id) => {
    removeNode(id);
    const tasksFromLocaleStorage = getTasksFromLocalStorage();
    if (!tasksFromLocaleStorage)
        return;
    const { pendingTasks, completedTasks } = tasksFromLocaleStorage;
    const taskToChangeStage = pendingTasks.find((task) => task.id === id);
    if (!taskToChangeStage)
        return;
    renderTaskInList({ ...taskToChangeStage, status: 'completed' }, $completedTasksList, 'completed-tasks-title', `Completed - ${(completedTasks.length + 1)}`);
    updateListTitle('pending-tasks-title', ((pendingTasks.length - 1) > 0) ? `Pending - ${(pendingTasks.length - 1)}` : '');
    updateStageofTaskInLocalStorage(id);
};
const deleteTask = (id) => {
    const tasksFromLocaleStorage = getTasksFromLocalStorage();
    if (!tasksFromLocaleStorage)
        return;
    const { completedTasks } = tasksFromLocaleStorage;
    updateListTitle('completed-tasks-title', ((completedTasks.length - 1) > 0) ? `Completed - ${(completedTasks.length - 1)}` : '');
    removeNode(id);
    deleteTaskFromLocalStorage(id);
};
const saveTaskInLocalStorage = (newTask) => {
    const tasksFromLocaleStorage = localStorage.getItem('tasks');
    if (tasksFromLocaleStorage) {
        const parsedTasks = JSON.parse(tasksFromLocaleStorage);
        const newTasks = [...parsedTasks, newTask];
        localStorage.setItem('tasks', JSON.stringify(newTasks));
    }
    else {
        localStorage.setItem('tasks', JSON.stringify([newTask]));
    }
};
const updateStageofTaskInLocalStorage = (id) => {
    const tasksFromLocaleStorage = localStorage.getItem('tasks');
    if (!tasksFromLocaleStorage)
        return;
    const parsedTasks = JSON.parse(tasksFromLocaleStorage);
    const updatedTasks = parsedTasks.map((task) => {
        if (task.id === id)
            return { ...task, status: 'completed' };
        else
            return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
};
const deleteTaskFromLocalStorage = (id) => {
    const tasksFromLocaleStorage = localStorage.getItem('tasks');
    if (!tasksFromLocaleStorage || tasksFromLocaleStorage.length === 0)
        return;
    const parsedTasks = JSON.parse(tasksFromLocaleStorage);
    const updatedTasks = parsedTasks.filter(({ id: taskId }) => (taskId !== id));
    localStorage.setItem('tasks', JSON.stringify([...updatedTasks]));
};
const generateWelcomeMessage = () => {
    if (!$greetings)
        return;
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    let greetings = '';
    if (currentHour >= 6 && currentHour < 12)
        greetings = 'Good morning, have a nice day!';
    else if (currentHour >= 12 && currentHour < 19)
        greetings = 'Good afternoon, I hope you are having a good day!';
    else if (currentHour >= 19 && currentHour < 24)
        greetings = 'Good evening, I hope you have a good one!';
    else
        greetings = 'Hi, web surfing into late hours?';
    $greetings.textContent = greetings;
};
const getCurrentDate = () => {
    const currentDate = new Date();
    const currentDayNumber = currentDate.getDate();
    const currentDayName = currentDate.toLocaleDateString(undefined, { weekday: 'long' });
    $date.textContent = `${currentDayName} ${currentDayNumber}`;
};
const loadCategories = () => {
    if (!$addTaskCategories)
        return;
    for (const categoryKey in categories) {
        $addTaskCategories.innerHTML += `
      <span 
        class="chip1 chip1--color-${categoryKey}" 
        onclick="selectTaskCategory(${categoryKey})"
        id="category-${categoryKey}"
      >
        ${categories[categoryKey].name}
      </span>`;
    }
};
const initialLoadOfTasks = () => {
    const tasksFromLocaleStorage = getTasksFromLocalStorage();
    if (!tasksFromLocaleStorage)
        return;
    const { pendingTasks, completedTasks } = tasksFromLocaleStorage;
    updateListTitle('pending-tasks-title', (pendingTasks.length > 0) ? `Pending - ${pendingTasks.length}` : '');
    if (pendingTasks.length > 0)
        pendingTasks.forEach((task) => renderTaskInList(task, $pendingTasksList));
    updateListTitle('completed-tasks-title', (completedTasks.length > 0) ? `Completed - ${completedTasks.length}` : '');
    if (completedTasks.length > 0)
        completedTasks.forEach((task) => renderTaskInList(task, $completedTasksList));
};
//* Events listeners
$addTaskButton?.addEventListener('click', () => openAddTaskModal(true));
//* Initial load
generateWelcomeMessage();
getCurrentDate();
loadCategories();
initialLoadOfTasks();
