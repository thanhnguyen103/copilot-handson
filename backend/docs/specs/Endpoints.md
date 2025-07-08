# RESTful API Endpoints for Task Management System

## Authentication
- **POST /api/auth/register** — Register a new user
- **POST /api/auth/login** — Log in a user
- **POST /api/auth/logout** — Log out the current user
- **GET /api/auth/session** — Get current session status

## Tasks
- **GET /api/tasks** — Get all tasks for the authenticated user (supports filtering and search via query params)
- **POST /api/tasks** — Create a new task
- **GET /api/tasks/:id** — Get details of a specific task
- **PUT /api/tasks/:id** — Update a task (title, description, priority, due date, status)
- **DELETE /api/tasks/:id** — Delete a task
- **PATCH /api/tasks/:id/complete** — Mark a task as complete
- **PATCH /api/tasks/:id/incomplete** — Mark a task as incomplete

## Task Filtering & Search (Query Parameters for GET /api/tasks)
- `status` — Filter by status (`all`, `completed`, `incomplete`)
- `priority` — Filter by priority (`low`, `medium`, `high`)
- `due` — Filter by due date (`today`, `this_week`, `overdue`)
- `search` — Search tasks by keyword in title/description

## Priorities
- **GET /api/priorities** — Get all priority levels

## Categories
- **GET /api/categories** — Get all categories for the user
- **POST /api/categories** — Create a new category
- **PUT /api/categories/:id** — Update a category
- **DELETE /api/categories/:id** — Delete a category

## Task Summary
- **GET /api/tasks/summary** — Get a summary (total, completed, overdue) for the user

---

### Example: Filtering & Search
`GET /api/tasks?status=completed&priority=high&due=overdue&search=report`

This design supports secure authentication, full CRUD for tasks, filtering, search, and summary features.