import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const userService = new UserService();

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message, code: 400 });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await userService.authenticate(email, password);
      res.json({ token, user });
    } catch (err: any) {
      res.status(401).json({ message: err.message, code: 401 });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      // In a real implementation, you might want to invalidate the token
      // For now, we'll just return success
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ message: err.message, code: 500 });
    }
  }

  static async getSession(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({ message: 'Unauthorized', code: 401 });
      }
      const user = await userService.getProfile(user_id);
      res.json({ user, active: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message, code: 500 });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ message: 'Unauthorized', code: 401 });
      const user = await userService.getProfile(user_id);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message, code: 500 });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ message: 'Unauthorized', code: 401 });
      const user = await userService.updateProfile(user_id, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message, code: 400 });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = req.body;
      await userService.resetPassword(email, newPassword);
      res.json({ message: 'Password reset successful' });
    } catch (err: any) {
      res.status(400).json({ message: err.message, code: 400 });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ message: 'Unauthorized', code: 401 });
      await userService.deleteUser(user_id);
      res.json({ message: 'User deleted' });
    } catch (err: any) {
      res.status(500).json({ message: err.message, code: 500 });
    }
  }
}
