-- PostgreSQL DDL for Task Management System

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Create priorities table
CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    level INTEGER NOT NULL
);
CREATE INDEX idx_priorities_level ON priorities(level);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    priority_id INTEGER REFERENCES priorities(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_priority_id ON tasks(priority_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- (Optional) Create task_assignments table for multi-user assignments
-- Uncomment if you want to support assigning tasks to multiple users
--
-- CREATE TABLE task_assignments (
--     task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
--     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     PRIMARY KEY (task_id, user_id)
-- );
-- CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
-- CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
