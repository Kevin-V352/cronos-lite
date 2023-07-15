import { type Task } from '../interfaces';

import { categories } from '../data';

import { selectors } from '.';

/** @module utils/elementsGenerators */

/**
 * It swaps the title between lists.
 * @param {('pending-tasks-title' | 'completed-tasks-title')} listTitleElementId ID of the title element.
 * @param {string} value Value of the new title.
 */
const renderListTitle = (listTitleElementId: 'pending-tasks-title' | 'completed-tasks-title', value: string): void => {

  const $listTitle = document.getElementById(listTitleElementId) as HTMLTitleElement;

  if (!$listTitle) return;

  $listTitle.textContent = value;

};

/**
 * It adds a task into a list.
 * @param {Task} task Task to add.
 * @param {string} parentElementId Parent element ID.
 * @param {('pending-tasks-title' | 'completed-tasks-title')} listTitleId ID of the title element.
 * @param {string} listTitleValue Value of the new title.
 */
const renderTaskInList = (
  task: Task,
  parentElementId: string,
  listTitleId?: 'pending-tasks-title' | 'completed-tasks-title',
  listTitleValue?: string
): void => {

  const $parentElement = selectors.byId(parentElementId);

  if (!$parentElement) {

    console.error(`Element with ID ${parentElementId} does not exist`);
    return;

  };

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
        <h4 class="card-1__title ${!isPending ? 'card-1__title--strikethrough' : ''}">${title}</h4>
        <p class="card-1__description ${!isPending ? 'card-1__title--strikethrough' : ''}">${description ?? ''}</p>
        <span class="card-1__date">${date}</span>
      </div>
    </div>
  `;

  $parentElement.insertAdjacentHTML('afterbegin', newNode);

  if (listTitleId && listTitleValue !== undefined) renderListTitle(listTitleId, listTitleValue);

};

/**
 * It renders the task categories.
 * @param {string} parentElementId Parent element id.
 */
const renderCategories = (parentElementId: string): void => {

  const $parentElement = selectors.byId(parentElementId);

  if (!$parentElement) {

    console.error(`Element with ID ${parentElementId} does not exist`);
    return;

  };

  for (const categoryKey in categories) {

    $parentElement.innerHTML += `
      <span 
        class="chip-1 chip-1--color-${categoryKey}" 
        onclick="selectTaskCategory(${categoryKey})"
        id="category-${categoryKey}"
      >
        ${categories[categoryKey].name}
      </span>`;

  };

};

export {
  renderListTitle,
  renderTaskInList,
  renderCategories
};
