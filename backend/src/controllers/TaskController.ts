import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { TaskModel } from '../models/Task';
import { Pool } from 'pg';

const pool = new Pool();
const taskModel = new TaskModel(pool);
const taskService = new TaskService(taskModel);

export class TaskController {
  static async getTasks(req: Request, res: Response) {
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

  static async createTask(req: Request, res: Response) {
    try {
      const user_id = req.user?.id || req.body.user_id; // Adjust for your auth middleware
      const taskData = { ...req.body, user_id: Number(user_id) };
      const task = await taskService.createTask(taskData);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
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
