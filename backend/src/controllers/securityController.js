// src/controllers/securityController.js
import { findLeadById } from '../models/leadModel.js';
import { logSecurityEvent, fetchMasterAuditStream } from '../models/auditModel.js';

export const unmaskSensitiveField = async (req, res) => {
  const { lead_id, requested_field } = req.body;
  if (!['MOBILE_REVEAL', 'EMAIL_REVEAL'].includes(requested_field)) {
    return res.status(400).json({ error: 'Malformed field query parameters.' });
  }
  try {
    const leadRecord = await findLeadById(lead_id);
    if (!leadRecord) return res.status(404).json({ error: 'Target record missing.' });

    if (req.user.role !== 'super_admin' && leadRecord.assigned_to !== req.user.id && req.user.department !== leadRecord.product_category) {
      return res.status(403).json({ error: 'Clearance fault. Access Denied.' });
    }

    await logSecurityEvent(req.user.id, requested_field, lead_id, req.ip, req.headers['user-agent'] || 'Unknown');
    const decryptedValue = requested_field === 'MOBILE_REVEAL' ? leadRecord.mobile_raw : leadRecord.email_raw;
    return res.json({ decrypted_value: decryptedValue });
  } catch (err) {
    return res.status(500).json({ error: 'Security fault while decoding string.' });
  }
};

export const getAuditStream = async (req, res) => {
  try {
    const logs = await fetchMasterAuditStream();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to access security event repository stream.' });
  }
};