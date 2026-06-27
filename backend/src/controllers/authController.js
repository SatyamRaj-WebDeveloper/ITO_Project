// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserProfile, findUserByEmployeeId, bindUserDevice } from '../models/userModel.js';
import { logSecurityEvent } from '../models/auditModel.js';

export const registerWorkforce = async (req, res) => {
  const { employee_id, password, temporary_password, full_name, department, role } = req.body;
  try {
    // ✅ FIXED: Safely read either variable key format from the Admin panel form payloads
    const cleanPassword = password || temporary_password;

    if (!cleanPassword) {
      return res.status(400).json({ error: 'Validation Fault: Access assignment password string is missing.' });
    }

    const password_hash = await bcrypt.hash(cleanPassword, 10);
    const profile = await createUserProfile(employee_id, password_hash, full_name, department, role);
    return res.status(201).json({ message: 'Workforce profile registered successfully.', profile });
  } catch (err) {
    console.error("🔥 Registration Fault:", err.message);
    return res.status(500).json({ error: 'Database constraint violation. Account initialization dropped.' });
  }
};

export const loginWorkspace = async (req, res) => {
  const { employee_id, password, device_signature } = req.body;
  try {
    // 1. Fetch live user record from your Neon PostgreSQL database
    const user = await findUserByEmployeeId(employee_id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid identification credentials.' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    // 🚀 MASTER OVERRIDE HANDSHAKE HOOK FOR THE FOUNDER DEMO
    const isAdminMasterBypass = (user.role === 'super_admin' && password === 'RamizSecurePassword2026');

    // 2. Perform direct Bcrypt validation against database's stored password_hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch && !isAdminMasterBypass) {
      await logSecurityEvent(user.id, 'LOGIN_FAILED', null, req.ip, `ID: ${employee_id} | ${req.headers['user-agent'] || 'Unknown'}`);
      return res.status(401).json({ error: 'Authentication verification failure.' });
    }

    // 3. Device fingerprint check with fallback for Super Admin matching
    const assignedFingerprint = user.device_fingerprint;
    const isDeviceMatch = (assignedFingerprint === device_signature) || 
                          (user.role === 'super_admin' && (device_signature === 'FOUNDER-SECURE-TERMINAL' || device_signature === 'FOUNDER-DESK-SECURE'));

    if (assignedFingerprint && !isDeviceMatch) {
      await logSecurityEvent(user.id, 'LOGIN_FAILED', null, req.ip, `Device mismatch attempt: ${device_signature}`);
      return res.status(403).json({ error: 'Device signature lock mismatch.' });
    }

    if (!assignedFingerprint && device_signature) {
      await bindUserDevice(user.id, device_signature);
    }

    // 4. Generate the signed session token matching access thresholds
    const token = jwt.sign(
      { id: user.id, role: user.role, department: user.department }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    await logSecurityEvent(user.id, 'LOGIN_SUCCESS', null, req.ip, req.headers['user-agent'] || 'Browser Client');

    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.full_name || 'Administrator', 
        role: user.role, 
        department: user.department 
      } 
    });

  } catch (err) {
    console.error("🔥 Detailed Login Crash:", err);
    return res.status(500).json({ error: 'Internal system fault during authentication cycle.' });
  }
};