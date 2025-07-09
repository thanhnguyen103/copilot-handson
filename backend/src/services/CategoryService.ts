import { Category, CategoryRepository } from '../repository/CategoryRepository';

export class CategoryService {
  static async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return CategoryRepository.getCategoriesByUserId(userId);
  }
}
