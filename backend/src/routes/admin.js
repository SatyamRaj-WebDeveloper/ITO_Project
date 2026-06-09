// backend/src/routes/admin.js
import express from 'express';
import { provisionNewEmployee , modifyUserAccessStatus} from '../controllers/adminController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/provision-employee', verifyToken, restrictTo('super_admin'), provisionNewEmployee);
router.post('/user-access/:userId', verifyToken, modifyUserAccessStatus);

export default router;