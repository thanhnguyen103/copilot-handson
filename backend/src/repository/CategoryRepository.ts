import pool from '../config/db';

export interface Category {
  id: number;
  name: string;
  user_id: number;
}

export class CategoryRepository {
  static async createUncategorizedForUser(userId: number): Promise<void> {
    await pool.query(
      `INSERT INTO categories (name, user_id)
       VALUES ($1, $2)
       ON CONFLICT (name, user_id) DO NOTHING`,
      ['Uncategorized', userId]
    );
  }

  static async getCategoriesByUserId(userId: number): Promise<Category[]> {
    const result = await pool.query(
      `SELECT id, name, user_id FROM categories WHERE user_id = $1 ORDER BY id ASC`,
      [userId]
    );
    return result.rows;
  }
}
