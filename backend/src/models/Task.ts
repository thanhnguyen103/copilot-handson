import { Pool } from 'pg';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: Date;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskFilter {
  status?: string;
  user_id?: number;
  search?: string;
  due_before?: Date;
  due_after?: Date;
}

export class TaskModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const result = await this.pool.query(
      `INSERT INTO tasks (title, description, status, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [task.title, task.description, task.status, task.due_date, task.user_id]
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<Task | null> {
    const result = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async update(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return this.findById(id);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => (updates as any)[f]);
    const result = await this.pool.query(
      `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(filter: TaskFilter = {}): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const values: any[] = [];
    let idx = 1;
    if (filter.status) {
      query += ` AND status = $${idx++}`;
      values.push(filter.status);
    }
    if (filter.user_id) {
      query += ` AND user_id = $${idx++}`;
      values.push(filter.user_id);
    }
    if (filter.due_before) {
      query += ` AND due_date < $${idx++}`;
      values.push(filter.due_before);
    }
    if (filter.due_after) {
      query += ` AND due_date > $${idx++}`;
      values.push(filter.due_after);
    }
    if (filter.search) {
      query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
      values.push(`%${filter.search}%`);
    }
    query += ' ORDER BY due_date ASC NULLS LAST, created_at DESC';
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getTasksByUser(user_id: number): Promise<Task[]> {
    const result = await this.pool.query('SELECT * FROM tasks WHERE user_id = $1', [user_id]);
    return result.rows;
  }
}
