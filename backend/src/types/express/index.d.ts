// Extend Express Request type to include user property for authentication
import { User } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
