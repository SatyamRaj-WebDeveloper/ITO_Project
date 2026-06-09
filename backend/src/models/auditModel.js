// src/models/auditModel.js
import pool from '../config/db.js';


export const logSecurityEvent = async (actorId, actionType, targetRecordId, ipAddress, deviceMetadata) => {
  const query = `
    INSERT INTO security_audit_logs (actor_id, action_type, target_record_id, ip_address, device_metadata) 
    VALUES ($1, $2, $3, $4, $5)
  `;
  return await pool.query(query, [actorId, actionType, targetRecordId, ipAddress, deviceMetadata]);
};

// Streams structural compliance logs to the admin command deck
export const fetchMasterAuditStream = async () => {
  const query = `
    SELECT s.*, u.employee_id, u.full_name, u.department 
    FROM security_audit_logs s 
    LEFT JOIN users u ON s.actor_id = u.id 
    ORDER BY s.timestamp DESC 
    LIMIT 100
  `;
  const result = await pool.query(query);
  return result.rows;
};