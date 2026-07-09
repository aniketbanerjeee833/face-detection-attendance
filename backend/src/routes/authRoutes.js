import express from 'express';
const router = express.Router();

import {  getMeAdmin,getMeSuperAdmin, logoutAdmin, logoutSuperAdmin, loginAdmin, loginSuperAdmin, loginOperator, logoutOperator, getMeOperator } from '../controllers/authController.js';
// import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import adminUserAuth from '../middleware/adminUserAuth.js';
import superAdminUserAuth from '../middleware/superAdminUserAuth.js';
import operatorUserAuth from '../middleware/operatorUserAuth.js';
// import  verifyToken  from '../middleware/authMiddleware.js';

// // router.post('/login', login);
// router.post('/admin/login', loginAdmin);
// router.post('/superadmin/login', loginSuperAdmin);
// // routes/authRoutes.js
// router.get('/admin/me', getMeAdmin);
// router.get('/superadmin/me', getMeSuperAdmin);
// // router.get('/me', getMe);
// router.post('/admin/logout', logoutAdmin);
// router.post('/superadmin/logout', logoutSuperAdmin);
router.post('/admin/login', loginAdmin);
router.post('/superadmin/login', loginSuperAdmin);
router.post('/operator/login', loginOperator);

router.post('/admin/logout', adminUserAuth, logoutAdmin);
router.post('/superadmin/logout', superAdminUserAuth, logoutSuperAdmin);
router.post('/operator/logout', operatorUserAuth, logoutOperator);

router.get('/admin/me', getMeAdmin);
router.get('/superadmin/me', getMeSuperAdmin);
router.get('/operator/me', getMeOperator);
// router.post('/admin/login', loginAdmin);
// router.post('/superadmin/login', loginSuperAdmin);
// router.post('/admin/logout', adminUserAuth, logoutAdmin);
// router.post('/superadmin/logout', superAdminUserAuth, logoutSuperAdmin);
// router.get('/admin/me', getMeAdmin);
// router.get('/superadmin/me', getMeSuperAdmin);

export default router;