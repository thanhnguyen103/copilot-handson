import { Pool } from 'pg';

export const testPool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

export async function resetDatabase() {
  // Truncate all tables and reset sequences for a clean state
  await testPool.query('TRUNCATE tasks RESTART IDENTITY CASCADE');
  await testPool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  // Add more tables as needed
}

export async function closeTestDatabase() {
  await testPool.end();
}

export async function createTestUser({ username = 'testuser', email = 'test@example.com', password = 'password123' } = {}) {
  const res = await testPool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [username, email, password]
  );
  return res.rows[0];
}

export async function createTestTask({ title = 'Test Task', user_id = 1, status = 'pending', due_date = null } = {}) {
  const res = await testPool.query(
    'INSERT INTO tasks (title, user_id, status, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, user_id, status, due_date]
  );
  return res.rows[0];
}
