import express from 'express';
const router = express.Router();

import { login, getMe } from '../controllers/authController.js';
// import  verifyToken  from '../middleware/authMiddleware.js';

router.post('/login', login);
router.get('/me', getMe);

export default router;