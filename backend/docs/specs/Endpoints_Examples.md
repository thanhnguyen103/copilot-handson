\*# Example HTTP Requests and Responses for Task Management API

## Register a New User

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "secret123"}'
```

**Response:**

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "created_at": "2025-07-09T10:00:00Z"
}
```

## Login

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "secret123"}'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "created_at": "2025-07-09T10:00:00Z"
  }
}
```

## Create a Task

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Finish report", "description": "Complete the Q2 report", "priority": "high", "category": "Work", "due_date": "2025-07-15"}'
```

**Response:**

```json
{
  "id": 10,
  "title": "Finish report",
  "description": "Complete the Q2 report",
  "priority": "high",
  "category": "Work",
  "due_date": "2025-07-15",
  "completed": false,
  "created_at": "2025-07-09T10:05:00Z",
  "updated_at": "2025-07-09T10:05:00Z"
}
```

## Update a Task

**Request:**

```bash
curl -X PUT http://localhost:3000/api/v1/tasks/10 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Finish report (updated)", "completed": true}'
```

**Response:**

```json
{
  "id": 10,
  "title": "Finish report (updated)",
  "description": "Complete the Q2 report",
  "priority": "high",
  "category": "Work",
  "due_date": "2025-07-15",
  "completed": true,
  "created_at": "2025-07-09T10:05:00Z",
  "updated_at": "2025-07-09T11:00:00Z"
}
```

## Error: Invalid Login

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "wrongpass"}'
```

**Response:**

```json
{
  "message": "Invalid email or password.",
  "code": 401
}
```

## Error: Unauthorized Task Creation

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Unauthorized task"}'
```

**Response:**

```json
{
  "message": "Authentication required.",
  "code": 401
}
```

## Error: Task Not Found

**Request:**

```bash
curl -X GET http://localhost:3000/api/v1/tasks/999 \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "message": "Task not found.",
  "code": 404
}
```
