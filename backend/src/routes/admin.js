// backend/src/routes/admin.js
import express from 'express';
import { provisionNewEmployee } from '../controllers/adminController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/provision-employee', verifyToken, restrictTo('super_admin'), provisionNewEmployee);

export default router;