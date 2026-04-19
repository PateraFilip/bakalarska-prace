let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let currentFilter = 'all';

        const todoListEl = document.getElementById('todo-list');
        const formEl = document.getElementById('todo-form');
        const inputEl = document.getElementById('todo-input');
        const emptyStateEl = document.getElementById('empty-state');
        const itemsLeftEl = document.getElementById('items-left');
        const clearBtnEl = document.getElementById('clear-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        function save() {
            localStorage.setItem('todos', JSON.stringify(todos));
            render();
        }

        function addTodo(text) {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            todos.unshift(newTodo);
            save();
        }

        function toggleTodo(id) {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                save();
            }
        }

        function deleteTodo(id) {
            todos = todos.filter(t => t.id !== id);
            save();
        }

        function clearCompleted() {
            if(confirm('Smazat všechny dokončené úkoly?')) {
                todos = todos.filter(t => !t.completed);
                save();
            }
        }

        function setFilter(filter) {
            currentFilter = filter;

            filterBtns.forEach(btn => {
                if(btn.id === `filter-${filter}`) {
                    btn.classList.add('bg-gray-800', 'text-white', 'shadow-lg');
                    btn.classList.remove('text-gray-500');
                } else {
                    btn.classList.remove('bg-gray-800', 'text-white', 'shadow-lg');
                    btn.classList.add('text-gray-500');
                }
            });
            render();
        }

        function render() {
            todoListEl.innerHTML = '';

            let filteredTodos = todos;
            if (currentFilter === 'active') filteredTodos = todos.filter(t => !t.completed);
            if (currentFilter === 'completed') filteredTodos = todos.filter(t => t.completed);

            if (filteredTodos.length === 0) {
                emptyStateEl.classList.remove('hidden');
            } else {
                emptyStateEl.classList.add('hidden');
            }

            filteredTodos.forEach(todo => {
                const item = document.createElement('div');
                item.className = `group flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all fade-in ${todo.completed ? 'opacity-50' : ''}`;

                item.innerHTML = `
                    <button onclick="toggleTodo(${todo.id})" class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-500'}">
                        ${todo.completed ? '<svg class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>' : ''}
                    </button>

                    <span class="flex-1 text-sm font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'} cursor-pointer" onclick="toggleTodo(${todo.id})">
                        ${todo.text}
                    </span>

                    <button onclick="deleteTodo(${todo.id})" class="text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100" title="Smazat">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                todoListEl.appendChild(item);
            });

            const activeCount = todos.filter(t => !t.completed).length;
            const completedCount = todos.length - activeCount;

            itemsLeftEl.textContent = `${activeCount} ${activeCount === 1 ? 'úkol zbývá' : (activeCount >= 2 && activeCount <= 4 ? 'úkoly zbývají' : 'úkolů zbývá')}`;

            if (completedCount > 0) {
                clearBtnEl.classList.remove('hidden');
            } else {
                clearBtnEl.classList.add('hidden');
            }
        }

        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = inputEl.value.trim();
            if (text) {
                addTodo(text);
                inputEl.value = '';
                inputEl.focus();
            }
        });

        render();