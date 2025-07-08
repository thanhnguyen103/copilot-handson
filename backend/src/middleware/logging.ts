import morgan from 'morgan';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport if needed
    // new winston.transports.File({ filename: 'error.log', level: 'error' })
  ],
});

// Morgan middleware for HTTP logging
const httpLogger = morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
});

// Error logging middleware
function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  next(err);
}

export { logger, httpLogger, errorLogger };
