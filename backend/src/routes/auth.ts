import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { query } from '../config/db';

const router = Router();

// Input validation helpers
function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function isValidPassword(password: string) {
  return typeof password === 'string' && password.length >= 6;
}

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format', code: 400 });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters', code: 400 });
  }
  try {
    // Check if user exists
    const userExists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered', code: 400 });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );
    const user = result.rows[0];
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn as string } as jwt.SignOptions
    );
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required', code: 400 });
  }
  try {
    const result = await query('SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password', code: 401 });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password', code: 401 });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn as string } as jwt.SignOptions
    );
    // Remove password_hash from response
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
});

export default router;
