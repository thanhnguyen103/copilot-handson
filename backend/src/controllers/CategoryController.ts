import { Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export class CategoryController {
  static async getCategoriesByUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const categories = await CategoryService.getCategoriesByUserId(user_id);
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
