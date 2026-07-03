import express from 'express';
const router = express.Router();

import {  getMe, logoutAdmin, logoutSuperAdmin, loginAdmin, loginSuperAdmin } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
// import  verifyToken  from '../middleware/authMiddleware.js';

// router.post('/login', login);
router.post('/admin/login', loginAdmin);
router.post('/superadmin/login', loginSuperAdmin);
router.get('/me', getMe);
router.post('/admin/logout', logoutAdmin);
router.post('/superadmin/logout', logoutSuperAdmin);
// router.post("/logout",userAuth,logout);

export default router;