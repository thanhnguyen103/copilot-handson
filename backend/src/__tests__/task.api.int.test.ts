import request from 'supertest';
import { Pool } from 'pg';
import app from '../app';

const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

beforeAll(async () => {
  // Clean and migrate test DB
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});

let authToken: string;
let userId: number;
let taskId: number;

describe('Task Management API', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    userId = res.body.data.id;
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    authToken = res.body.data.token;
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Integration Test Task', status: 'pending' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    taskId = res.body.data.id;
  });

  it('should get all tasks for the user', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a specific task', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(taskId);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Task Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Task Title');
  });

  it('should mark a task as completed', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });

  afterAll(async () => {
    // Clean up test user
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });
});
