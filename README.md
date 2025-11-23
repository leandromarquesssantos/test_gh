# Todo List Application

A simple web-based todo list application with user authentication and data persistence.

## Features

- **User Authentication**: Login and registration system
- **Remember Me**: Option to stay logged in across browser sessions
- **Personal Todo Lists**: Each user has their own private todo list
- **CRUD Operations**: Create, Read, Update, and Delete tasks
- **Data Persistence**: All data is stored in JSON format using browser's localStorage
- **User Isolation**: Users can only see and manage their own tasks

## How to Use

1. **Open the Application**
   - Open `index.html` in your web browser

2. **Register a New Account**
   - Enter a username and password
   - Click "Register" button
   - You'll see a success message

3. **Login**
   - Enter your username and password
   - Check "Remember me" if you want to stay logged in
   - Click "Login" button

4. **Manage Tasks**
   - **Add Task**: Enter task title and optional description, then click "Add Task"
   - **Edit Task**: Click "Edit" button on any task, modify the details, and click "Add Task"
   - **Delete Task**: Click "Delete" button on any task (will ask for confirmation)
   - **Logout**: Click "Logout" button in the top right

## Technical Details

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Storage**: Browser localStorage (JSON format)
- **No Backend Required**: Everything runs in the browser

## Data Storage

All data is stored in the browser's localStorage with the following structure:

```json
{
  "todoapp_users": [
    {
      "username": "user1",
      "password": "password",
      "todos": [
        {
          "id": 1234567890,
          "title": "Task title",
          "description": "Task description",
          "createdAt": "2025-11-23T20:00:00.000Z",
          "updatedAt": "2025-11-23T20:00:00.000Z"
        }
      ]
    }
  ],
  "todoapp_current_user": "user1",
  "todoapp_remember_me": "true"
}
```

## Security Notes

- This is a simple demonstration application
- Passwords are stored in plain text (not recommended for production)
- For production use, implement proper backend with encrypted storage
- Data is only secure within the browser and is not shared across devices
