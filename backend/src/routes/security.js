
import express from 'express';
import { unmaskSensitiveField, getAuditStream } from '../controllers/securityController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/unmask-field', verifyToken, unmaskSensitiveField);
router.get('/audit-stream', verifyToken, restrictTo('super_admin'), getAuditStream);

export default router;