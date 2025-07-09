import { Request, Response } from 'express';
import { query } from '../config/db';

export class PriorityController {
  static async getPriorities(req: Request, res: Response) {
    try {
      const result = await query('SELECT id, name, level FROM priorities ORDER BY level ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ message: err.message, code: 500 });
    }
  }
}
