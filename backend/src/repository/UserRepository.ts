import { query } from '../config/db';
import bcrypt from 'bcryptjs';
import { User, UserSchema } from '../models/User';

export class UserRepository {
  static async create(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    const parsed = UserSchema.safeParse(user);
    if (!parsed.success) throw new Error('Invalid user input');
    const password_hash = await bcrypt.hash(user.password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [user.username, user.email, password_hash]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async update(id: number, data: Partial<User>): Promise<User | null> {
    // Only allow updating username and email
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.username) { fields.push(`username = $${idx++}`); values.push(data.username); }
    if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id`, values);
    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async verifyPassword(email: string, password: string): Promise<boolean> {
    const result = await query('SELECT password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return false;
    return bcrypt.compare(password, result.rows[0].password_hash);
  }

  static async updatePassword(id: number, password_hash: string): Promise<boolean> {
    const result = await query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
    return (result.rowCount ?? 0) > 0;
  }
}
