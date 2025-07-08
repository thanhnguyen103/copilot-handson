import { Task, TaskFilter, TaskModel } from '../models/Task';
// import { PriorityModel } from '../models/Priority'; // Uncomment if you add a Priority model

export class TaskService {
  private taskModel: TaskModel;
  // private priorityModel: PriorityModel; // Uncomment if you add a Priority model

  constructor(taskModel: TaskModel) {
    this.taskModel = taskModel;
    // this.priorityModel = priorityModel;
  }

  // Validation helpers
  validateTaskInput(task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): string[] {
    const errors: string[] = [];
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required.');
    }
    if (task.due_date && isNaN(new Date(task.due_date).getTime())) {
      errors.push('Due date is invalid.');
    }
    // Add more validation as needed
    return errors;
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const errors = this.validateTaskInput(task);
    if (errors.length) throw new Error(errors.join(' '));
    // Optionally: validate priority exists
    // if (task.priority_id && !(await this.priorityModel.exists(task.priority_id))) {
    //   throw new Error('Invalid priority.');
    // }
    // Due date management: set to null if not provided
    if (!task.due_date) (task as any).due_date = null;
    return this.taskModel.create(task);
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.taskModel.findById(id);
  }

  async updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> {
    if (updates.due_date && isNaN(new Date(updates.due_date).getTime())) {
      throw new Error('Due date is invalid.');
    }
    // Optionally: validate priority exists
    // if (updates.priority_id && !(await this.priorityModel.exists(updates.priority_id))) {
    //   throw new Error('Invalid priority.');
    // }
    return this.taskModel.update(id, updates);
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.taskModel.delete(id);
  }

  async getTasks(filter: TaskFilter = {}): Promise<Task[]> {
    return this.taskModel.findAll(filter);
  }

  async getTasksByUser(user_id: number): Promise<Task[]> {
    return this.taskModel.getTasksByUser(user_id);
  }

  // Example: Mark task as completed
  async markTaskCompleted(id: number): Promise<Task | null> {
    return this.taskModel.update(id, { status: 'completed' });
  }

  // Example: Change task priority (if priority_id is supported in your schema/model)
  async changeTaskPriority(id: number, updates: { [key: string]: any }): Promise<Task | null> {
    // Optionally: validate priority exists
    // if (updates.priority_id && !(await this.priorityModel.exists(updates.priority_id))) {
    //   throw new Error('Invalid priority.');
    // }
    return this.taskModel.update(id, updates);
  }

  // Example: Get overdue tasks
  async getOverdueTasks(user_id: number): Promise<Task[]> {
    const now = new Date();
    return this.taskModel.findAll({ user_id, due_before: now, status: 'pending' });
  }
}
