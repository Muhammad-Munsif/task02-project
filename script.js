document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const remainingCount = document.getElementById('remaining-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Initialize the app
    function init() {
        renderTodos();
        updateRemainingCount();
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', filterTodos);
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
    }
    
    // Render todos based on current filter
    function renderTodos(filter = 'all') {
        todoList.innerHTML = '';
        
        let filteredTodos = [];
        
        switch(filter) {
            case 'active':
                filteredTodos = todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed);
                break;
            default:
                filteredTodos = todos;
        }
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }
        
        filteredTodos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';
            todoItem.dataset.id = todo.id;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            todoList.appendChild(todoItem);
            
            // Add event listeners to the new elements
            const checkbox = todoItem.querySelector('.todo-checkbox');
            const deleteBtn = todoItem.querySelector('.delete-btn');
            const todoText = todoItem.querySelector('.todo-text');
            
            checkbox.addEventListener('change', () => toggleTodoComplete(todo.id));
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            todoText.addEventListener('dblclick', () => editTodo(todo.id, todoText));
        });
    }
    
    // Add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;
        
        const newTodo = {
            id: Date.now(),
            text,
            completed: false
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos(getCurrentFilter());
        todoInput.value = '';
        updateRemainingCount();
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        todos = todos.map(todo => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        );
        saveTodos();
        renderTodos(getCurrentFilter());
        updateRemainingCount();
    }
    
    // Delete a todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos(getCurrentFilter());
        updateRemainingCount();
    }
    
    // Edit a todo
    function editTodo(id, element) {
        const currentText = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        element.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                todos = todos.map(todo => 
                    todo.id === id ? {...todo, text: newText} : todo
                );
                saveTodos();
            }
            
            // Re-render regardless to show the normal view
            renderTodos(getCurrentFilter());
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }
    
    // Filter todos
    function filterTodos(e) {
        const filter = e.target.dataset.filter;
        
        // Update active button
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        renderTodos(filter);
    }
    
    // Get current filter
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.filter : 'all';
    }
    
    // Clear completed todos
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos(getCurrentFilter());
    }
    
    // Update remaining count
    function updateRemainingCount() {
        const count = todos.filter(todo => !todo.completed).length;
        remainingCount.textContent = `${count} ${count === 1 ? 'item' : 'items'} left`;
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Initialize the app
    init();
});