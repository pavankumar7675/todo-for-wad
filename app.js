document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const tasksCount = document.getElementById('tasks-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskTemplate = document.getElementById('task-template');

    // App State
    let tasks = JSON.parse(localStorage.getItem('doItTasks')) || [];
    let currentFilter = 'all';
    let draggedItem = null;

    // Initialize App
    function init() {
        renderTasks();
        updateTasksCount();
        setupEventListeners();
    }

    // Save tasks to localStorage
    function saveTasksToStorage() {
        localStorage.setItem('doItTasks', JSON.stringify(tasks));
    }

    // Render tasks based on current filter
    function renderTasks() {
        // Clear the current list
        taskList.innerHTML = '';

        // Filter tasks based on current filter
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'pending') return !task.completed;
            return true;
        });

        // Render each task
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    // Create task element from template
    function createTaskElement(task) {
        const taskClone = document.importNode(taskTemplate.content, true);
        const taskItem = taskClone.querySelector('.task-item');
        const taskText = taskClone.querySelector('.task-text');
        
        taskItem.dataset.id = task.id;
        taskText.textContent = task.text;
        
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Setup task-specific event listeners
        setupTaskEventListeners(taskItem);
        
        return taskItem;
    }

    // Setup task-specific event listeners
    function setupTaskEventListeners(taskElement) {
        const completeBtn = taskElement.querySelector('.complete-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', () => {
            toggleTaskComplete(taskElement.dataset.id);
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteTask(taskElement.dataset.id);
        });
        
        // Drag and drop functionality
        taskElement.addEventListener('dragstart', handleDragStart);
        taskElement.addEventListener('dragend', handleDragEnd);
        taskElement.addEventListener('dragover', handleDragOver);
        taskElement.addEventListener('dragenter', handleDragEnter);
        taskElement.addEventListener('dragleave', handleDragLeave);
        taskElement.addEventListener('drop', handleDrop);
    }

    // Setup global event listeners
    function setupEventListeners() {
        // Add new task
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewTask();
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        
        // Filter tasks
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setFilter(btn.dataset.filter);
                
                // Update active filter UI
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Add new task
    function addNewTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false
        };
        
        tasks.unshift(newTask);
        saveTasksToStorage();
        
        // Clear input
        taskInput.value = '';
        
        // Re-render and update count
        renderTasks();
        updateTasksCount();
        
        // Focus back on input
        taskInput.focus();
    }

    // Toggle task complete status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasksToStorage();
        renderTasks();
        updateTasksCount();
    }

    // Delete task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        
        saveTasksToStorage();
        renderTasks();
        updateTasksCount();
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        
        saveTasksToStorage();
        renderTasks();
        updateTasksCount();
    }

    // Set current filter
    function setFilter(filter) {
        currentFilter = filter;
        renderTasks();
    }

    // Update tasks count
    function updateTasksCount() {
        const pendingTasks = tasks.filter(task => !task.completed).length;
        tasksCount.textContent = `${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} left`;
    }

    // Drag and drop handlers
    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop() {
        this.classList.remove('drag-over');
        
        if (draggedItem !== this) {
            // Get the indexes of the dragged and target items
            const draggableTasks = [...taskList.querySelectorAll('.task-item')];
            const draggedIndex = draggableTasks.indexOf(draggedItem);
            const targetIndex = draggableTasks.indexOf(this);
            
            // Get the IDs to update the tasks array
            const draggedId = draggedItem.dataset.id;
            const targetId = this.dataset.id;
            
            // Find the corresponding tasks in our array
            const draggedTaskIdx = tasks.findIndex(task => task.id === draggedId);
            const targetTaskIdx = tasks.findIndex(task => task.id === targetId);
            
            // Reorder tasks
            if (draggedTaskIdx !== -1 && targetTaskIdx !== -1) {
                const [removedTask] = tasks.splice(draggedTaskIdx, 1);
                tasks.splice(targetTaskIdx, 0, removedTask);
                
                saveTasksToStorage();
                renderTasks();
            }
        }
    }

    // Initialize the app
    init();
});