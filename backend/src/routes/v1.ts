import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { UserController } from '../controllers/UserController';
// import { AuthMiddleware } from '../middleware/auth'; // Uncomment if you have an auth middleware

const router = Router();

// User routes
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.get('/auth/profile', /*AuthMiddleware,*/ UserController.getProfile);
router.put('/auth/profile', /*AuthMiddleware,*/ UserController.updateProfile);
router.post('/auth/reset-password', UserController.resetPassword);
router.delete('/auth/delete', /*AuthMiddleware,*/ UserController.deleteUser);

// Task routes (protected)
router.get('/tasks', /*AuthMiddleware,*/ TaskController.getTasks);
router.post('/tasks', /*AuthMiddleware,*/ TaskController.createTask);
router.get('/tasks/:id', /*AuthMiddleware,*/ TaskController.getTaskById);
router.put('/tasks/:id', /*AuthMiddleware,*/ TaskController.updateTask);
router.delete('/tasks/:id', /*AuthMiddleware,*/ TaskController.deleteTask);
router.patch('/tasks/:id/complete', /*AuthMiddleware,*/ TaskController.markTaskCompleted);
router.patch('/tasks/:id/incomplete', /*AuthMiddleware,*/ TaskController.markTaskIncomplete);

export default router;
