// src/routes/leads.js
import express from 'express';
import { ingestLeadStream, getWorkspaceLeads , updateLeadStatus , revealSensitiveContact} from '../controllers/leadController.js';
import { verifyToken } from '../middleware/auth.js';
import enforceDataMasking from '../middleware/security.js';

const router = express.Router();

router.post('/ingest-stream', ingestLeadStream);
router.get('/workspace-board', verifyToken, enforceDataMasking, getWorkspaceLeads);
router.patch('/:leadId/status', verifyToken, updateLeadStatus);
router.post('/:leadId/reveal', verifyToken, revealSensitiveContact);

export default router;