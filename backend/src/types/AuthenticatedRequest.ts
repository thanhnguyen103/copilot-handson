import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        username: string;
        email: string;
        password: string;
        id?: number;
        created_at?: string;
    };
}