import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  created_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
