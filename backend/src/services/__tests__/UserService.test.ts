import { UserService } from '../UserService';
import { UserRepository } from '../../repository/UserRepository';
import bcrypt from 'bcryptjs';

jest.mock('../../repository/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'token') }));

describe('UserService', () => {
  let service: UserService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it('should register a new user', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.create as jest.Mock).mockResolvedValue({ id: 1, username: 'u', email: 'e', created_at: new Date() });
    const user = await service.register({ username: 'user1', email: 'user1@example.com', password: 'password123' });
    expect(user).toHaveProperty('id');
  });

  it('should not register with existing email', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });
    await expect(service.register({ username: 'user1', email: 'user1@example.com', password: 'password123' })).rejects.toThrow('Email already registered');
  });

  it('should authenticate and return token', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'e', password: 'hash' });
    (UserRepository.verifyPassword as jest.Mock).mockResolvedValue(true);
    const result = await service.authenticate('e', 'password123');
    expect(result).toHaveProperty('token');
  });

  it('should fail authentication with wrong password', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'e', password: 'hash' });
    (UserRepository.verifyPassword as jest.Mock).mockResolvedValue(false);
    await expect(service.authenticate('e', 'bad')).rejects.toThrow('Invalid credentials');
  });

  it('should get user profile', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1, username: 'u' });
    const user = await service.getProfile(1);
    expect(user).toHaveProperty('id');
  });

  it('should update profile', async () => {
    (UserRepository.update as jest.Mock).mockResolvedValue({ id: 1, username: 'new' });
    const user = await service.updateProfile(1, { username: 'new' });
    expect(user?.username).toBe('new');
  });

  it('should reset password', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'e' });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (UserRepository.updatePassword as jest.Mock).mockResolvedValue(true);
    const result = await service.resetPassword('e', 'newpass');
    expect(result).toBe(true);
  });

  it('should throw if user not found for reset', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(service.resetPassword('e', 'newpass')).rejects.toThrow('User not found');
  });

  it('should delete user', async () => {
    (UserRepository.delete as jest.Mock).mockResolvedValue(true);
    const result = await service.deleteUser(1);
    expect(result).toBe(true);
  });
});
