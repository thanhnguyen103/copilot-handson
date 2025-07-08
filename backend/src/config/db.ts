import { Pool } from 'pg';
import { config } from '../config/env';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
