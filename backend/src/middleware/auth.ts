import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'Authorization header missing or malformed',
        code: 401 
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Token missing',
        code: 401 
      });
      return;
    }

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ 
          success: false,
          message: 'Invalid or expired token',
          code: 401,
          error: err.name 
        });
        return;
      }

      if (!decoded || typeof decoded === 'string') {
        res.status(401).json({ 
          success: false,
          message: 'Invalid token payload',
          code: 401 
        });
        return;
      }

      // Attach user info to request object
      (req as AuthenticatedRequest).user = decoded as {
        username: string;
        email: string;
        password: string;
        id?: number;
        created_at?: string;
      };
      
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication',
      code: 500 
    });
  }
}
