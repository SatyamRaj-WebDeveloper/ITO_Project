// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Security Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userQuery = await pool.query(
      'SELECT id, employee_id, role, department, is_active, device_fingerprint FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (userQuery.rows.length === 0 || !userQuery.rows[0].is_active) {
      return res.status(403).json({ error: 'Session unauthorized. Profile suspended or deactivated.' });
    }

    req.user = userQuery.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid authentication parameters.' });
  }
};


export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      pool.query(
        'INSERT INTO security_audit_logs (actor_id, action_type, ip_address, device_metadata) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'UNAUTHORIZED_VIEW', req.ip, req.headers['user-agent'] || 'Unknown']
      ).catch(e => console.error('Logging failure:', e.message));

      return res.status(403).json({ error: 'Access Denied. Insufficient organizational clearances.' });
    }
    next();
  };
};