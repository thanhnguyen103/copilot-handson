import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await userService.authenticate(email, password);
      res.json({ success: true, data: { user, token } });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const user = await userService.getProfile(user_id);
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const user = await userService.updateProfile(user_id, req.body);
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = req.body;
      await userService.resetPassword(email, newPassword);
      res.json({ success: true, message: 'Password reset successful' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });
      await userService.deleteUser(user_id);
      res.json({ success: true, message: 'User deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
