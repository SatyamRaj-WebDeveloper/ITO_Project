// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

// Route Registry Modules
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import securityRoutes from './routes/security.js';
import adminRoutes from  './routes/admin.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enforce modern security parameters across headers configurations
app.use(cors({
  origin: '*', // Tightly restrict to official domain names prior to final production release execution [cite: 320, 840]
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Corporate Router Slices Mapping Table
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/admin' , adminRoutes)

// Base System Structural Integration Health Path
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    return res.json({
      status: 'ONLINE',
      timestamp: new Date(),
      database_connection: 'STABLE',
      db_server_time: dbCheck.rows[0].now
    });
  } catch (err) {
    return res.status(500).json({ status: 'DEGRADED', database: 'OFFLINE', error: err.message });
  }
});

// Global App Interception Handler
app.use((err, req, res, next) => {
  console.error('🔥 Severe Uncaught Application Incident Exception:', err.stack);
  res.status(500).json({ error: 'Severe backend infrastructure failure encountered.' });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 INDIA TRADE OVERSEAS OPERATING SYSTEM ACTIVE ON PORT: ${PORT}`);
  console.log(`🔒 SECURITY MODULE ENGINE SCRIPT TYPE: NATIVE ES MODULE (IMPORT)`);
  console.log(`================================================================`);
});

export default app;