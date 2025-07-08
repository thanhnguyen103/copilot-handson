import { Request, Response, NextFunction } from 'express';

// Password must be at least 8 characters, include uppercase, lowercase, number, and special character
export function validatePasswordStrength(req: Request, res: Response, next: NextFunction) {
  const { password } = req.body;
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!password || !strongPassword.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      code: 400
    });
  }
  next();
}
