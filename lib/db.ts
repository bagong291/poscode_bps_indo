import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In dev, we keep running and show a clear error when queries are used.
  console.warn("[db] Missing DATABASE_URL. Set it in environment variables.");
}

export const pool = new Pool({
  connectionString,
  max: 20, // Increase pool size for better concurrency
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increase from 2s to 5s
  allowExitOnIdle: false,
});

export async function query<T = any>(text: string, params: any[] = [], retries = 3): Promise<T[]> {
  let client;
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      client = await pool.connect();
      const res = await client.query(text, params);
      return res.rows as T[];
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt + 1}/${retries}):`, error);
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    } finally {
      if (client) {
        client.release();
        client = undefined;
      }
    }
  }

  throw lastError || new Error('Query failed after retries');
}
