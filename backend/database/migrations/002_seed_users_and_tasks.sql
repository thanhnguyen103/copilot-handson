-- Seed data for priorities table
INSERT INTO priorities (name, level) VALUES
  ('Low', 1),
  ('Medium', 2),
  ('High', 3);

-- Seed data for users and tasks tables

-- Insert users
INSERT INTO users (username, email, password_hash)
VALUES
  ('alice', 'alice@example.com', '$2b$10$examplehashforalice'),
  ('bob', 'bob@example.com', '$2b$10$examplehashforbob'),
  ('charlie', 'charlie@example.com', '$2b$10$examplehashforcharlie');

-- Insert tasks
INSERT INTO tasks (title, description, due_date, completed, user_id)
VALUES
  ('Buy groceries', 'Milk, Bread, Eggs', '2025-07-10', FALSE, 1),
  ('Finish project report', 'Complete the final draft', '2025-07-12', FALSE, 2),
  ('Workout', 'Gym session for 1 hour', '2025-07-09', TRUE, 1),
  ('Read a book', 'Read 50 pages of a novel', NULL, FALSE, 3);
