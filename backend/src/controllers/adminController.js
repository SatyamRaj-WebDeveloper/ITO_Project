// backend/src/controllers/adminController.js
import bcrypt from 'bcrypt';
import pool from '../config/db.js'; // Ensure this points to your configured connection pool
import { logSecurityEvent } from '../models/auditModel.js'; // FIX: Import the database logger function directly

export const provisionNewEmployee = async (req, res) => {
  const { full_name, department, role, temporary_password } = req.body;
  const adminId = req.user.id; 

  try {
    // 1. Strict authorization enforcement check
    if (req.user.role !== 'super_admin') {
      // Safely logs the unauthorized attempt to the database logs ledger table
      await logSecurityEvent(adminId, 'UNAUTHORIZED_VIEW', null, req.ip, 'Attempted to provision an employee without super_admin clearance.');
      return res.status(403).json({ error: 'Access denied. Insufficient administrative permissions.' });
    }

    // 2. Automated Sequence ID Calculator Logic
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM users WHERE department = $1', 
      [department]
    );
    const sequenceNum = parseInt(countRes.rows[0].count) + 1;
    const paddedSequence = String(sequenceNum).padStart(3, '0');
    
    const currentYear = new Date().getFullYear();
    const generatedEmployeeId = `ITO-${department.toUpperCase()}-${currentYear}-${paddedSequence}`;

    // 3. Salt and hash the temporary password
    const saltRounds = 10;
    const hashedTempPassword = await bcrypt.hash(temporary_password, saltRounds);

    // 4. Save the profile record directly to Neon PostgreSQL
    const insertQuery = `
      INSERT INTO users (employee_id, password_hash, full_name, department, role, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, employee_id, full_name, department, role;
    `;
    
    const newUserRes = await pool.query(insertQuery, [
      generatedEmployeeId, 
      hashedTempPassword, 
      full_name, 
      department, 
      role
    ]);

    // 5. FIX: Call logSecurityEvent cleanly with the proper parameters matching its definition
    await logSecurityEvent(
      adminId, 
      'LEAD_EDITED', // Maps to the standard entry type constraint in your audit schema
      newUserRes.rows[0].id, 
      req.ip, 
      `Provisioned new profile: ${generatedEmployeeId} (${full_name})`
    );

    return res.status(201).json({
      message: 'Workforce profile successfully initialized.',
      user: newUserRes.rows[0],
      plain_text_temp_pass: temporary_password 
    });

  } catch (err) {
    console.error("🔥 Employee Provisioning Fault:", err);
    return res.status(500).json({ error: 'Internal system fault during workforce account allocation.' });
  }
};

export const modifyUserAccessStatus = async (req, res) => {
  const { userId } = req.params;
  const { action_type } = req.body; // Expects 'LOCK' or 'UNLOCK'
  const adminId = req.user.id;

  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access Denied. Root clearance mandatory.' });
    }

    const setActiveStatus = action_type === 'UNLOCK';
    
    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, employee_id, full_name, is_active',
      [setActiveStatus, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee account target not found.' });
    }

    // Log administrative intervention footprint
    await logSecurityEvent(
      adminId,
      setActiveStatus ? 'LOGIN_SUCCESS' : 'UNAUTHORIZED_VIEW',
      userId,
      req.ip,
      `Administrative override executed: Permanently ${action_type}ED employee profile ${result.rows[0].employee_id}`
    );

    return res.json({
      message: `Employee account status successfully updated to ${action_type}ED.`,
      user: result.rows[0]
    });

  } catch (err) {
    console.error("🔥 Access Matrix Modification Failure:", err.message);
    return res.status(500).json({ error: 'Internal server database override fault.' });
  }
};