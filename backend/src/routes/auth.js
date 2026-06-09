// src/routes/auth.js
import express from 'express';
import { registerWorkforce, loginWorkspace } from '../controllers/authController.js';

const router = express.Router();

router.post('/register-workforce', registerWorkforce);
router.post('/login-workspace', loginWorkspace);

export default router;