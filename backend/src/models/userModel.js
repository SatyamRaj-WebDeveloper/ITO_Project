// src/models/userModel.js
import pool from '../config/db.js';

// Finds an active account using its unique workforce identifier string
export const findUserByEmployeeId = async (employeeId) => {
  const query = 'SELECT * FROM users WHERE employee_id = $1';
  const result = await pool.query(query, [employeeId]);
  return result.rows[0];
};

// Finds an account profile using its internal database primary key UUID
export const findUserById = async (id) => {
  const query = 'SELECT id, employee_id, role, department, is_active, device_fingerprint FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Permanently updates an account profile with a specific device identifier signature
export const bindUserDevice = async (userId, deviceSignature) => {
  const query = 'UPDATE users SET device_fingerprint = $1 WHERE id = $2';
  return await pool.query(query, [deviceSignature, userId]);
};

// Inserts a new workforce account profile into the database schema
export const createUserProfile = async (employeeId, passwordHash, fullName, department, role) => {
  const query = `
    INSERT INTO users (employee_id, password_hash, full_name, department, role) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, employee_id, role, department
  `;
  const result = await pool.query(query, [employeeId, passwordHash, fullName, department, role]);
  return result.rows[0];
};