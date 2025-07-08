import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed', code: 401 });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      return res.status(401).json({ message: 'Invalid or expired token', code: 401 });
    }
    req.user = decoded as {
      username: string;
      email: string;
      password: string;
      id?: number;
      created_at?: string;
    };
    next();
  });
}
