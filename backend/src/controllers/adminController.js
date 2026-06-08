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