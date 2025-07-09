import { Pool } from 'pg';
import { config } from '../config/env';
import { logger } from '../middleware/logging';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
});

// Enhanced error handling with logging
pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', {
    error: {
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
      severity: (err as any).severity,
      detail: (err as any).detail
    },
    poolConfig: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user
    }
  });
  process.exit(-1);
});

// Log successful connection
pool.on('connect', (client) => {
  logger.info('New PostgreSQL client connected', {
    processId: (client as any).processID || 'unknown',
    database: config.db.name,
    host: config.db.host,
    port: config.db.port
  });
});

// Log client disconnection
pool.on('remove', (client) => {
  logger.debug('PostgreSQL client removed from pool', {
    processId: (client as any).processID || 'unknown'
  });
});

export const query = (text: string, params?: any[]) => {
  const startTime = Date.now();
  
  logger.debug('Executing database query', {
    query: text,
    params: params ? params.map((p, i) => ({ [`$${i + 1}`]: p })) : undefined
  });
  
  return pool.query(text, params)
    .then(result => {
      const duration = Date.now() - startTime;
      logger.debug('Database query completed', {
        duration: `${duration}ms`,
        rowCount: result.rowCount,
        command: result.command
      });
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      logger.error('Database query failed', {
        query: text,
        params: params ? params.map((p, i) => ({ [`$${i + 1}`]: p })) : undefined,
        duration: `${duration}ms`,
        error: {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
          position: error.position,
          severity: error.severity
        }
      });
      throw error;
    });
};

export default pool;
