// src/controllers/leadController.js
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