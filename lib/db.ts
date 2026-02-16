/**
 * Database Connection for Next.js App
 * 
 * Connects to PostgreSQL database for verse, topic, and intent data
 * Uses connection pooling for serverless environment
 */

import { Pool } from 'pg';

// Singleton pool instance
let pool: Pool | null = null;

/**
 * Get database pool (singleton)
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error', err);
    });
  }

  return pool;
}

/**
 * Execute a query
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executed', { text, duration, rows: res.rowCount });
    }
    
    return res.rows;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

/**
 * Get a single row
 */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

/**
 * Close pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
