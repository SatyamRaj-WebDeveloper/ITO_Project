
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 30000, // Automatically drops idle connections to protect server memory
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('⚡ PostgreSQL relational engine pool initialized successfully.');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool degradation:', err.message);
});

export default pool;