import express from 'express';
const router = express.Router();

import { markAttendance, getAttendance, getSummary, getAttendanceSuperAdmin } from '../controllers/attendanceController.js';
import  verifyToken  from '../middleware/authMiddleware.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import superAdminAuth from '../middleware/superAdminAuth.js';

// router.use(verifyToken);

router.post('/mark', userAuth,adminAuth,markAttendance);
router.get('/',userAuth,adminAuth, getAttendance);
// attendanceRoutes.js
router.get('/summary', userAuth, superAdminAuth, getSummary);
// router.get('/summary/today',userAuth,adminAuth, getTodaySummary);
router.get('/superadmin/all', userAuth, superAdminAuth, getAttendanceSuperAdmin);
export default router;