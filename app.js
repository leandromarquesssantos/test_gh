// Data storage keys
const STORAGE_KEYS = {
    USERS: 'todoapp_users',
    CURRENT_USER: 'todoapp_current_user',
    REMEMBER_ME: 'todoapp_remember_me'
};

// State
let currentUser = null;
let editingTaskId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Check if user should be remembered
    const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (rememberMe === 'true' && savedUser) {
        currentUser = savedUser;
        showTodoScreen();
    } else {
        showLoginScreen();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-btn').addEventListener('click', handleRegister);
    
    // Todo form
    document.getElementById('todo-form').addEventListener('submit', handleTodoSubmit);
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showLoginError('Username not found. Please register first.');
        return;
    }
    
    if (user.password !== password) {
        showLoginError('Incorrect password.');
        return;
    }
    
    // Login successful
    currentUser = username;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
    
    showTodoScreen();
}

// Handle registration
function handleRegister() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showLoginError('Please enter username and password.');
        return;
    }
    
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
        showLoginError('Username already exists. Please login or choose a different username.');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        todos: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = 'Registration successful! Please login.';
    errorElement.className = 'success-message';
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('remember-me').checked = false;
    
    showLoginScreen();
}

// Handle todo submit (add or edit)
function handleTodoSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('todo-title').value.trim();
    const description = document.getElementById('todo-description').value.trim();
    
    if (!title) {
        return;
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) {
        return;
    }
    
    if (editingTaskId !== null) {
        // Edit existing task
        const todoIndex = users[userIndex].todos.findIndex(t => t.id === editingTaskId);
        if (todoIndex !== -1) {
            users[userIndex].todos[todoIndex].title = title;
            users[userIndex].todos[todoIndex].description = description;
            users[userIndex].todos[todoIndex].updatedAt = new Date().toISOString();
        }
        editingTaskId = null;
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    } else {
        // Add new task
        const newTodo = {
            id: generateUniqueId(),
            title,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        users[userIndex].todos.push(newTodo);
    }
    
    saveUsers(users);
    
    // Clear form
    document.getElementById('todo-title').value = '';
    document.getElementById('todo-description').value = '';
    
    renderTodos();
}

// Cancel edit
function cancelEdit() {
    editingTaskId = null;
    document.getElementById('todo-title').value = '';
    document.getElementById('todo-description').value = '';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Edit todo
function editTodo(id) {
    const users = getUsers();
    const user = users.find(u => u.username === currentUser);
    
    if (!user) {
        return;
    }
    
    const todo = user.todos.find(t => t.id === id);
    
    if (!todo) {
        return;
    }
    
    editingTaskId = id;
    document.getElementById('todo-title').value = todo.title;
    document.getElementById('todo-description').value = todo.description;
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    
    // Scroll to form
    document.getElementById('todo-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete todo
function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) {
        return;
    }
    
    users[userIndex].todos = users[userIndex].todos.filter(t => t.id !== id);
    saveUsers(users);
    
    renderTodos();
}

// Render todos
function renderTodos() {
    const users = getUsers();
    const user = users.find(u => u.username === currentUser);
    
    const todoList = document.getElementById('todo-list');
    const noTasksMessage = document.getElementById('no-tasks-message');
    
    if (!user || user.todos.length === 0) {
        todoList.innerHTML = '';
        noTasksMessage.classList.remove('hidden');
        return;
    }
    
    noTasksMessage.classList.add('hidden');
    
    // Sort todos by creation date (newest first)
    const sortedTodos = [...user.todos].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    todoList.innerHTML = sortedTodos.map(todo => `
        <div class="todo-item">
            <h3>${escapeHtml(todo.title)}</h3>
            ${todo.description ? `<p>${escapeHtml(todo.description)}</p>` : ''}
            <div class="todo-meta">
                Created: ${formatDate(todo.createdAt)}
                ${todo.updatedAt !== todo.createdAt ? ` | Updated: ${formatDate(todo.updatedAt)}` : ''}
            </div>
            <div class="todo-actions">
                <button class="btn btn-edit" onclick="editTodo(${todo.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show login screen
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('todo-screen').classList.add('hidden');
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = '';
    errorElement.className = 'error-message';
}

// Show todo screen
function showTodoScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('todo-screen').classList.remove('hidden');
    document.getElementById('current-user').textContent = `Logged in as: ${currentUser}`;
    
    renderTodos();
}

// Show login error
function showLoginError(message) {
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = message;
    errorElement.className = 'error-message';
}

// Generate unique ID for tasks
function generateUniqueId() {
    // Use crypto.randomUUID() if available, otherwise fall back to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Get users from storage
function getUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
}

// Save users to storage
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
