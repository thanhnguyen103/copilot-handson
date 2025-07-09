import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// User routes
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.get('/auth/profile', authenticateJWT, UserController.getProfile);
router.put('/auth/profile', authenticateJWT, UserController.updateProfile);
router.post('/auth/reset-password', UserController.resetPassword);
router.delete('/auth/delete', authenticateJWT, UserController.deleteUser);

// Task routes (protected)
router.get('/tasks', authenticateJWT, TaskController.getTasks);
router.post('/tasks', authenticateJWT, TaskController.createTask);
router.get('/tasks/:id', authenticateJWT, TaskController.getTaskById);
router.put('/tasks/:id', authenticateJWT, TaskController.updateTask);
router.delete('/tasks/:id', authenticateJWT, TaskController.deleteTask);
router.patch('/tasks/:id/complete', authenticateJWT, TaskController.markTaskCompleted);
router.patch('/tasks/:id/incomplete', authenticateJWT, TaskController.markTaskIncomplete);

export default router;
