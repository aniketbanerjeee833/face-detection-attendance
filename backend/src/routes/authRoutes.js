import express from 'express';
const router = express.Router();

import { login, getMe, logout } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
// import  verifyToken  from '../middleware/authMiddleware.js';

router.post('/login', login);
router.get('/me', getMe);
router.post("/logout",userAuth,logout);

export default router;