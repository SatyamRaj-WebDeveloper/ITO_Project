// src/models/leadModel.js
import pool from '../config/db.js';

// Saves a freshly ingested data stream record directly to the database
export const createLeadEntry = async (leadData) => {
  const {
    source, customer_name, company_name, mobile_raw, email_raw,
    product_category, quantity_required, destination_city,
    payment_terms, delivery_terms, chat_summary, priority
  } = leadData;

  const query = `
    INSERT INTO leads (source, customer_name, company_name, mobile_raw, email_raw, product_category, quantity_required, destination_city, payment_terms, delivery_terms, chat_summary, priority)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING id, priority, status
  `;

  const values = [
    source, customer_name, company_name, mobile_raw, email_raw,
    product_category, quantity_required, destination_city,
    payment_terms, delivery_terms, chat_summary, priority
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Returns all database rows matching the global system view parameters
export const findAllLeads = async () => {
  const query = 'SELECT * FROM leads ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

// Returns database rows filtered by their functional division tier
export const findLeadsByDepartment = async (department) => {
  const query = 'SELECT * FROM leads WHERE product_category = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [department]);
  return result.rows;
};

// Returns database rows assigned directly to a unique user account
export const findLeadsByOwner = async (userId) => {
  const query = 'SELECT * FROM leads WHERE assigned_to = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Returns a single lead record matching an explicit database primary key UUID
export const findLeadById = async (leadId) => {
  const query = 'SELECT * FROM leads WHERE id = $1';
  const result = await pool.query(query, [leadId]);
  return result.rows[0];
};