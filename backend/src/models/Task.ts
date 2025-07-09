import { Pool } from 'pg';
import { logger } from '../middleware/logging';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'incompleted' | 'completed'; // <-- Only allow 'incompleted' or 'completed'
  due_date?: Date;
  user_id: number;
  category_id?: number;
  priority_id?: number;
  created_at: Date;
  updated_at: Date;
  priority?: Priority;
  category?: Category;
}

export interface Priority {
  id: number;
  name: string;
  level: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface TaskFilter {
  status?: string;
  user_id?: number;
  search?: string;
  due_before?: Date;
  due_after?: Date;
  category_id?: number;
  priority_id?: number;
}

export class TaskModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    logger.info('TaskModel.create: Starting task creation', {
      method: 'create',
      input: {
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        user_id: task.user_id,
        category_id: task.category_id,
        priority_id: task.priority_id
      }
    });

    try {
      const query = `INSERT INTO tasks (title, description, status, due_date, user_id, category_id, priority_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`;
      
      const params = [
        task.title,
        task.description,
        task.status,
        task.due_date,
        task.user_id,
        task.category_id ?? null,
        task.priority_id ?? null
      ];
      
      logger.debug('TaskModel.create: Executing SQL query', {
        query,
        params: params.map((p, i) => ({ [`$${i + 1}`]: p }))
      });

      const result = await this.pool.query(query, params);
      
      logger.info('TaskModel.create: Task created successfully', {
        taskId: result.rows[0]?.id,
        rowCount: result.rowCount
      });

      return result.rows[0];
    } catch (error: any) {
      logger.error('TaskModel.create: Database error during task creation', {
        error: {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
          position: error.position,
          internalPosition: error.internalPosition,
          internalQuery: error.internalQuery,
          where: error.where,
          schema: error.schema,
          table: error.table,
          column: error.column,
          dataType: error.dataType,
          constraint: error.constraint
        },
        input: {
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
          user_id: task.user_id,
          category_id: task.category_id,
          priority_id: task.priority_id
        }
      });
      throw error;
    }
  }

  async findById(id: number): Promise<Task | null> {
    const result = await this.pool.query(
      `SELECT t.*, p.name as priority_name, p.level as priority_level
       FROM tasks t
       LEFT JOIN priorities p ON t.priority_id = p.id
       WHERE t.id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      priority: row.priority_id
        ? { id: row.priority_id, name: row.priority_name, level: row.priority_level }
        : undefined
    };
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
    let query = `
      SELECT 
        t.*, 
        p.name as priority_name, 
        p.level as priority_level,
        c.name as category_name
      FROM tasks t
      LEFT JOIN priorities p ON t.priority_id = p.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let idx = 1;
    if (filter.status && filter.status !== 'all') {
      query += ` AND t.status = $${idx++}`;
      values.push(filter.status);
    }
    if (filter.user_id) {
      query += ` AND t.user_id = $${idx++}`;
      values.push(filter.user_id);
    }
    if (filter.due_before) {
      query += ` AND t.due_date < $${idx++}`;
      values.push(filter.due_before);
    }
    if (filter.due_after) {
      query += ` AND t.due_date > $${idx++}`;
      values.push(filter.due_after);
    }
    if (filter.search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      values.push(`%${filter.search}%`);
      idx++;
    }
    if (filter.category_id) {
      query += ` AND t.category_id = $${idx++}`;
      values.push(filter.category_id);
    }
    if (filter.priority_id) {
      query += ` AND t.priority_id = $${idx++}`;
      values.push(filter.priority_id);
    }
    query += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';
    const result = await this.pool.query(query, values);
    return result.rows.map(row => ({
      ...row,
      priority: row.priority_id
        ? { id: row.priority_id, name: row.priority_name, level: row.priority_level }
        : undefined,
      category: row.category_id
        ? { id: row.category_id, name: row.category_name }
        : undefined
    }));
  }

  async getTasksByUser(user_id: number): Promise<Task[]> {
    const result = await this.pool.query(
      `SELECT t.*, p.name as priority_name, p.level as priority_level
       FROM tasks t
       LEFT JOIN priorities p ON t.priority_id = p.id
       WHERE t.user_id = $1`,
      [user_id]
    );
    return result.rows.map(row => ({
      ...row,
      priority: row.priority_id
        ? { id: row.priority_id, name: row.priority_name, level: row.priority_level }
        : undefined
    }));
  }
}
