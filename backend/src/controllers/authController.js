// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserProfile, findUserByEmployeeId, bindUserDevice } from '../models/userModel.js';
import { logSecurityEvent } from '../models/auditModel.js';

export const registerWorkforce = async (req, res) => {
  const { employee_id, password, full_name, department, role } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const profile = await createUserProfile(employee_id, password_hash, full_name, department, role);
    return res.status(201).json({ message: 'Workforce profile registered successfully.', profile });
  } catch (err) {
    return res.status(500).json({ error: 'Database constraint violation. Account initialization dropped.' });
  }
};

export const loginWorkspace = async (req, res) => {
  const { employee_id, password, device_signature } = req.body;
  try {
    const user = await findUserByEmployeeId(employee_id);
    if (!user) return res.status(401).json({ error: 'Invalid identification credentials.' });
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended.' });

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await logSecurityEvent(null, 'LOGIN_FAILED', null, req.ip, `ID: ${employee_id} | ${req.headers['user-agent']}`);
      return res.status(401).json({ error: 'Authentication verification failure.' });
    }

    if (user.device_fingerprint && user.device_fingerprint !== device_signature) {
      await logSecurityEvent(user.id, 'LOGIN_FAILED', null, req.ip, `Device mismatch attempt: ${device_signature}`);
      return res.status(403).json({ error: 'Device signature lock mismatch.' });
    }

    if (!user.device_fingerprint && device_signature) {
      await bindUserDevice(user.id, device_signature);
    }

    const token = jwt.sign({ id: user.id, role: user.role, department: user.department }, process.env.JWT_SECRET, { expiresIn: '8h' });
    await logSecurityEvent(user.id, 'LOGIN_SUCCESS', null, req.ip, req.headers['user-agent'] || 'Browser Client');

    return res.json({ token, user: { id: user.id, name: user.full_name, role: user.role, department: user.department } });
  } catch (err) {
    return res.status(500).json({ error: 'Internal system fault during authentication cycle.' });
  }
};