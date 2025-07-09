import { logger } from '../middleware/logging';
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
    logger.debug('TaskService.validateTaskInput: Starting validation', {
      input: {
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        user_id: task.user_id
      }
    });

    const errors: string[] = [];
    
    if (!task.title || task.title.trim().length === 0) {
      logger.warn('TaskService.validateTaskInput: Title validation failed', {
        title: task.title
      });
      errors.push('Title is required.');
    }
    
    if (task.due_date && isNaN(new Date(task.due_date).getTime())) {
      logger.warn('TaskService.validateTaskInput: Due date validation failed', {
        due_date: task.due_date,
        parsedDate: new Date(task.due_date)
      });
      errors.push('Due date is invalid.');
    }

    // Validate status
    if (task.status && !['pending', 'in_progress', 'completed'].includes(task.status)) {
      logger.warn('TaskService.validateTaskInput: Status validation failed', {
        status: task.status,
        allowedStatuses: ['pending', 'in_progress', 'completed']
      });
      errors.push('Status must be one of: pending, in_progress, completed.');
    }

    // Validate user_id
    if (task.user_id && (isNaN(Number(task.user_id)) || Number(task.user_id) <= 0)) {
      logger.warn('TaskService.validateTaskInput: User ID validation failed', {
        user_id: task.user_id,
        parsedUserId: Number(task.user_id)
      });
      errors.push('Valid user ID is required.');
    }

    logger.debug('TaskService.validateTaskInput: Validation completed', {
      errorsCount: errors.length,
      errors
    });

    // Add more validation as needed
    return errors;
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    logger.info('TaskService.createTask: Starting task creation process', {
      method: 'createTask',
      input: {
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        user_id: task.user_id
      }
    });

    try {
      // Validate input
      const errors = this.validateTaskInput(task);
      if (errors.length) {
        logger.error('TaskService.createTask: Validation failed', {
          errors,
          input: task
        });
        throw new Error(`Validation failed: ${errors.join(' ')}`);
      }

      // Set default status if not provided
      if (!task.status) {
        task.status = 'pending';
        logger.debug('TaskService.createTask: Set default status to pending');
      }

      // Due date management: set to null if not provided
      if (!task.due_date) {
        (task as any).due_date = null;
        logger.debug('TaskService.createTask: Set due_date to null (not provided)');
      }

      logger.debug('TaskService.createTask: Calling TaskModel.create', {
        processedTask: {
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
          user_id: task.user_id
        }
      });

      const createdTask = await this.taskModel.create(task);
      
      logger.info('TaskService.createTask: Task created successfully', {
        taskId: createdTask.id,
        title: createdTask.title,
        status: createdTask.status,
        user_id: createdTask.user_id
      });

      return createdTask;
    } catch (error: any) {
      logger.error('TaskService.createTask: Error during task creation', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        input: task
      });
      throw error;
    }
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
