// DOM Elements
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCounter = document.getElementById('task-counter');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Application State (Loaded from LocalStorage)
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// Add a new task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    priority: prioritySelect.value,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
}

// Toggle task completion status
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Clear all completed tasks
function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

// Render tasks to the DOM based on active filter
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = 'No tasks to display.';
    taskList.appendChild(emptyMsg);
  } else {
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;

      li.innerHTML = `
        <label class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text"></span>
        </label>
        <div class="task-right">
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
          <button class="delete-btn" title="Delete task">&times;</button>
        </div>
      `;

      // Safely set text content to prevent XSS
      li.querySelector('.task-text').textContent = task.text;

      // Event Listeners for Toggle and Delete
      li.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

      taskList.appendChild(li);
    });
  }

  // Update active task counter
  const activeCount = tasks.filter(task => !task.completed).length;
  taskCounter.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
}

// Event Listeners
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initial render on page load
renderTasks();
