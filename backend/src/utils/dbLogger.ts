import { logger } from '../middleware/logging';

/**
 * Database debugging utilities
 */
export class DbLogger {
  /**
   * Log database table structure for debugging
   */
  static async logTableStructure(pool: any, tableName: string) {
    try {
      logger.info(`Checking table structure for: ${tableName}`);
      
      // Get table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await pool.query(structureQuery, [tableName]);
      
      logger.info(`Table '${tableName}' structure:`, {
        table: tableName,
        columns: structureResult.rows.map((row: any) => ({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable,
          default: row.column_default,
          maxLength: row.character_maximum_length
        }))
      });

      // Check if table exists and has data
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      const countResult = await pool.query(countQuery);
      
      logger.info(`Table '${tableName}' contains ${countResult.rows[0].count} rows`);
      
    } catch (error: any) {
      logger.error(`Failed to get table structure for '${tableName}'`, {
        error: {
          message: error.message,
          code: error.code,
          detail: error.detail
        }
      });
    }
  }

  /**
   * Check database connection and log status
   */
  static async checkConnection(pool: any) {
    try {
      logger.info('Testing database connection...');
      
      const result = await pool.query('SELECT NOW() as current_time, version() as version');
      
      logger.info('Database connection successful', {
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version,
        connectionTest: 'PASSED'
      });
      
      return true;
    } catch (error: any) {
      logger.error('Database connection failed', {
        error: {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        },
        connectionTest: 'FAILED'
      });
      
      return false;
    }
  }

  /**
   * Log database constraints for a table
   */
  static async logTableConstraints(pool: any, tableName: string) {
    try {
      const constraintsQuery = `
        SELECT 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = $1 AND tc.table_schema = 'public';
      `;
      
      const result = await pool.query(constraintsQuery, [tableName]);
      
      logger.info(`Table '${tableName}' constraints:`, {
        table: tableName,
        constraints: result.rows.map((row: any) => ({
          name: row.constraint_name,
          type: row.constraint_type,
          column: row.column_name,
          foreignTable: row.foreign_table_name,
          foreignColumn: row.foreign_column_name
        }))
      });
      
    } catch (error: any) {
      logger.error(`Failed to get constraints for table '${tableName}'`, {
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
}
