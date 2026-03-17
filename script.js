 let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || {
            todo: [],
            inprogress: [],
            done: []
        };

        let draggedElement = null;

        function saveTasks() {
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        }

        function createTaskElement(taskText, taskId) {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.draggable = true;
            taskCard.dataset.taskId = taskId;

            const currentDate = new Date().toLocaleDateString();

            taskCard.innerHTML = `
                <div class="task-text">${taskText}</div>
                <div class="task-footer">
                    <span class="task-date">${currentDate}</span>
                    <button class="delete-task" onclick="deleteTask('${taskId}')">Delete</button>
                </div>
            `;

            // Drag events
            taskCard.addEventListener('dragstart', handleDragStart);
            taskCard.addEventListener('dragend', handleDragEnd);

            return taskCard;
        }

        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const taskText = taskInput.value.trim();

            if (taskText === '') return;

            const taskId = 'task_' + Date.now();
            tasks.todo.push({ id: taskId, text: taskText });

            saveTasks();
            renderTasks();

            taskInput.value = '';
        }

        function deleteTask(taskId) {
            for (let column in tasks) {
                tasks[column] = tasks[column].filter(task => task.id !== taskId);
            }
            saveTasks();
            renderTasks();
        }

        function renderTasks() {
            // Clear all columns
            document.getElementById('todoTasks').innerHTML = '';
            document.getElementById('inprogressTasks').innerHTML = '';
            document.getElementById('doneTasks').innerHTML = '';

            // Render tasks in each column
            for (let column in tasks) {
                const container = document.getElementById(column + 'Tasks');
                
                if (tasks[column].length === 0) {
                    container.innerHTML = '<div class="empty-state">Drop tasks here</div>';
                } else {
                    tasks[column].forEach(task => {
                        const taskElement = createTaskElement(task.text, task.id);
                        container.appendChild(taskElement);
                    });
                }

                // Update count
                document.getElementById(column + 'Count').textContent = tasks[column].length;
            }
        }

        function handleDragStart(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDragEnter(e) {
            this.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            this.classList.remove('drag-over');

            const targetColumn = this.closest('.column').dataset.column;
            const taskId = draggedElement.dataset.taskId;

            // Find and remove task from all columns
            let movedTask = null;
            for (let column in tasks) {
                const taskIndex = tasks[column].findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    movedTask = tasks[column].splice(taskIndex, 1)[0];
                    break;
                }
            }

            // Add to target column
            if (movedTask) {
                tasks[targetColumn].push(movedTask);
            }

            saveTasks();
            renderTasks();

            return false;
        }

        // Setup drop zones
        document.querySelectorAll('.tasks-container').forEach(container => {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('dragenter', handleDragEnter);
            container.addEventListener('dragleave', handleDragLeave);
            container.addEventListener('drop', handleDrop);
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', addTask);
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Initial render
        renderTasks();
