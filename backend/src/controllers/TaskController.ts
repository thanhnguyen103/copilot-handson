import { Request, Response } from 'express';
import { logger } from '../middleware/logging';
import { TaskModel } from '../models/Task';
import { TaskService } from '../services/TaskService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { DbLogger } from '../utils/dbLogger';
import pool from '../config/db';

// Use the shared pool from config/db
const taskModel = new TaskModel(pool);
const taskService = new TaskService(taskModel);

// Log database info on startup (development only)
if (process.env.NODE_ENV === 'development') {
  DbLogger.checkConnection(pool).then(() => {
    DbLogger.logTableStructure(pool, 'tasks');
    DbLogger.logTableConstraints(pool, 'tasks');
  });
}

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id || req.query.user_id; // Adjust for your auth middleware
      const filter = { ...req.query, user_id: Number(user_id) };
      const tasks = await taskService.getTasks(filter);
      res.json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const task = await taskService.getTaskById(id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response) {
    const requestId = Math.random().toString(36).substring(7);
    
    logger.info('TaskController.createTask: Received task creation request', {
      requestId,
      method: 'POST',
      endpoint: '/api/v1/tasks',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      user: {
        id: req.user?.id,
        email: req.user?.email
      },
      body: req.body
    });

    try {
      // Extract user ID from authenticated request
      const user_id = req.user?.id;
      
      if (!user_id) {
        logger.error('TaskController.createTask: No user ID found in request', {
          requestId,
          user: req.user,
          headers: {
            authorization: req.get('Authorization') ? 'Bearer [REDACTED]' : 'Not present'
          }
        });
        return res.status(401).json({ 
          success: false, 
          error: 'User authentication required',
          requestId
        });
      }

      logger.debug('TaskController.createTask: Preparing task data', {
        requestId,
        user_id,
        requestBody: req.body
      });

      // Prepare task data
      const taskData = { 
        ...req.body, 
        user_id: Number(user_id),
        status: req.body.status || 'pending'
      };

      logger.debug('TaskController.createTask: Task data prepared', {
        requestId,
        taskData: {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          due_date: taskData.due_date,
          user_id: taskData.user_id
        }
      });

      // Call service to create task
      const task = await taskService.createTask(taskData);
      
      logger.info('TaskController.createTask: Task created successfully', {
        requestId,
        taskId: task.id,
        title: task.title,
        user_id: task.user_id,
        status: task.status
      });

      res.status(201).json({ 
        success: true, 
        data: task,
        requestId
      });
    } catch (err: any) {
      logger.error('TaskController.createTask: Error during task creation', {
        requestId,
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name
        },
        user: {
          id: req.user?.id,
          email: req.user?.email
        },
        body: req.body
      });

      // Determine appropriate status code based on error type
      let statusCode = 400;
      if (err.message.includes('Validation failed')) {
        statusCode = 422; // Unprocessable Entity
      } else if (err.code === '23505') { // PostgreSQL unique violation
        statusCode = 409; // Conflict
      } else if (err.code === '23503') { // PostgreSQL foreign key violation
        statusCode = 400; // Bad Request
      } else if (err.code === '23502') { // PostgreSQL not null violation
        statusCode = 400; // Bad Request
      }

      res.status(statusCode).json({ 
        success: false, 
        error: err.message,
        requestId,
        errorCode: err.code || 'UNKNOWN_ERROR'
      });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const task = await taskService.updateTask(id, updates);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await taskService.deleteTask(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, message: 'Task deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async markTaskCompleted(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const task = await taskService.markTaskCompleted(id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async markTaskIncomplete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const task = await taskService.updateTask(id, { status: 'pending' });
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
