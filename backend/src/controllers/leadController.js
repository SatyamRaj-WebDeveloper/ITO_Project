// src/controllers/leadController.js
import pool from '../config/db.js';
import { createLeadEntry, findAllLeads, findLeadsByDepartment, findLeadsByOwner } from '../models/leadModel.js';
import { logSecurityEvent } from '../models/auditModel.js';

export const ingestLeadStream = async (req, res) => {
  const { source, customer_name, company_name, mobile_raw, email_raw, product_category, quantity_required, destination_city, payment_terms, delivery_terms, chat_summary } = req.body;
  try {
    let priority = 'Warm';
    if (quantity_required >= 1000 && company_name && mobile_raw) priority = 'Hot';
    else if (!mobile_raw || !customer_name) priority = 'Incomplete';

    const generatedLead = await createLeadEntry({
      source, customer_name, company_name, mobile_raw, email_raw,
      product_category, quantity_required, destination_city,
      payment_terms, delivery_terms, chat_summary, priority
    });

    await logSecurityEvent(null, 'AI_LEAD_CREATED', generatedLead.id, req.ip, `Lead initialized via pipeline.`);
    return res.status(201).json({ message: 'Lead ingestion complete.', data: generatedLead });
  } catch (err) {
    return res.status(500).json({ error: 'Processing error during lead streaming transaction.' });
  }
};

export const getWorkspaceLeads = async (req, res) => {
  try {
    let records;
    if (req.user.role === 'super_admin') records = await findAllLeads();
    else if (req.user.role === 'manager') records = await findLeadsByDepartment(req.user.department);
    else records = await findLeadsByOwner(req.user.id);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream target CRM records.' });
  }
};



export const updateLeadStatus = async (req, res) => {
  const { leadId } = req.params;
  const { status } = req.body; 
  const actorId = req.user.id;

  try {
    const updateQuery = `
      UPDATE leads 
      SET status = $1 
      WHERE id = $2 
      RETURNING id, customer_name, product_category, status;
    `;
    const result = await db.query(updateQuery, [status, leadId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Target customer lead record not found.' });
    }

    // 2. Track the operational action in your audit compliance ledger
    await logSecurityEvent(
      actorId,
      'LEAD_EDITED',
      leadId,
      req.ip,
      `Updated lead pipeline status context to: ${status}`
    );

    return res.json({
      message: 'Lead pipeline phase updated successfully.',
      lead: result.rows[0]
    });

  } catch (err) {
    console.error("🔥 Lead Status Update Error:", err.message);
    return res.status(500).json({ error: 'Database mutation fault during status context modification.' });
  }
};

export const revealSensitiveContact = async (req, res) => {
  const { leadId } = req.params;
  const { field_to_reveal } = req.body; 
  
  // Capture explicit actor credentials directly from the verified token middleware
  const currentActorId = req.user.id; 
  const currentActorRole = req.user.role;

  try {
    // 1. Pull current lead context from Neon
    const leadRes = await pool.query('SELECT id, customer_name, mobile_raw, email_raw FROM leads WHERE id = $1', [leadId]);
    if (leadRes.rows.length === 0) {
      return res.status(404).json({ error: 'Target procurement lead record missing.' });
    }

    const lead = leadRes.rows[0];
    const actionType = field_to_reveal === 'mobile' ? 'MOBILE_REVEAL' : 'EMAIL_REVEAL';

    // 2. SAFEGUARD CRITICAL HOOK: If the actor role is explicitly verified as super_admin,
    // log it under a separate administrative tracking label and skip employee threshold increments entirely!
    if (currentActorRole === 'super_admin') {
      await logSecurityEvent(
        currentActorId,
        actionType,
        leadId,
        req.ip,
        `EXECUTIVE AUDIT OVERRIDE: Super Admin unmasked ${field_to_reveal} details for customer: ${lead.customer_name}`
      );

      return res.json({
        revealed_data: field_to_reveal === 'mobile' ? lead.mobile_raw : lead.email_raw,
        auto_locked: false
      });
    }

    // 3. For standard workforce entries, proceed with logging and tracking violation limits normally
    await logSecurityEvent(
      currentActorId,
      actionType,
      leadId,
      req.ip,
      `Unmasked ${field_to_reveal} properties for buyer record: ${lead.customer_name}`
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM security_audit_logs 
       WHERE actor_id = $1 AND action_type IN ('MOBILE_REVEAL', 'EMAIL_REVEAL')`,
      [currentActorId]
    );
    const totalReveals = parseInt(countRes.rows[0].count);

    let accountSuspended = false;
    if (totalReveals >= 3) {
      await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [currentActorId]);
      accountSuspended = true;

      await logSecurityEvent(
        null, 
        'UNAUTHORIZED_VIEW', 
        currentActorId, 
        req.ip, 
        `CRITICAL COMPLIANCE LOCKOUT: Profile index ${currentActorId} auto-suspended due to threshold violations.`
      );
    }

    return res.json({
      revealed_data: field_to_reveal === 'mobile' ? lead.mobile_raw : lead.email_raw,
      auto_locked: accountSuspended
    });

  } catch (err) {
    console.error("🔥 Forensic Unmask Fault:", err.message);
    return res.status(500).json({ error: 'Data unmask execution drop.' });
  }
};