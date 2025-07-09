import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserSchema } from '../models/User';
import { CategoryRepository } from '../repository/CategoryRepository';
import { UserRepository } from '../repository/UserRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export class UserService {
  // Registration
  async register(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    // Validate input
    const parsed = UserSchema.safeParse(user);
    if (!parsed.success) throw new Error('Invalid user input');
    // Check for existing email
    const existing = await UserRepository.findByEmail(user.email);
    if (existing) throw new Error('Email already registered');
    const createdUser = (await UserRepository.create(user)) as User;
    // Seed 'Uncategorized' category for the new user
    if (typeof createdUser.id !== 'number') {
      throw new Error('User ID is missing after creation');
    }
    await CategoryRepository.createUncategorizedForUser(createdUser.id);
    return createdUser;
  }

  // Authentication (login)
  async authenticate(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    const valid = await UserRepository.verifyPassword(email, password);
    if (!valid) throw new Error('Invalid credentials');
    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  }

  // Get user profile
  async getProfile(id: number): Promise<User | null> {
    return UserRepository.findById(id);
  }

  // Update profile (username/email)
  async updateProfile(id: number, data: Partial<Pick<User, 'username' | 'email'>>): Promise<User | null> {
    return UserRepository.update(id, data);
  }

  // Password reset (request and update)
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('User not found');
    const password_hash = await bcrypt.hash(newPassword, 10);
    if (typeof user.id !== 'number') {
      throw new Error('User ID is missing');
    }
    await UserRepository.updatePassword(user.id, password_hash);
    return true;
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    return UserRepository.delete(id);
  }
}
