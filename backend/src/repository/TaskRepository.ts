import { Task, TaskFilter, TaskModel } from '../models/Task'; // Ensure this path is correct and the file exists

// If the file is named differently or located elsewhere, update the import path accordingly, e.g.:
// import { Task, TaskFilter, TaskModel } from '../models/task.model';

export class TaskRepository {
  private model: TaskModel;

  constructor(model: TaskModel) {
    this.model = model;
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return this.model.create(task);
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.model.findById(id);
  }

  async updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> {
    return this.model.update(id, updates);
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.model.delete(id);
  }

  async getTasks(filter: TaskFilter = {}): Promise<Task[]> {
    return this.model.findAll(filter);
  }

  async getTasksByUser(user_id: number): Promise<Task[]> {
    return this.model.getTasksByUser(user_id);
  }
}
