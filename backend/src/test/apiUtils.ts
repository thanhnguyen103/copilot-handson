import request from 'supertest';
import app from '../app';

export async function registerAndLoginTestUser({ username = 'apitest', email = 'apitest@example.com', password = 'password123' } = {}) {
  // Register
  await request(app)
    .post('/api/v1/auth/register')
    .send({ username, email, password });
  // Login
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  return res.body.data.token;
}

export async function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
