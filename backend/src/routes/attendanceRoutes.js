import express from 'express';
const router = express.Router();

import { markAttendance, getAttendance, getSummary, getAttendanceSuperAdmin, exportAttendanceSuperAdmin } from '../controllers/attendanceController.js';
// import  verifyToken  from '../middleware/authMiddleware.js';
// import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import superAdminAuth from '../middleware/superAdminAuth.js';
import superAdminUserAuth from '../middleware/superAdminUserAuth.js';
import adminUserAuth from '../middleware/adminUserAuth.js';

// router.use(verifyToken);

// router.post('/mark', userAuth,adminAuth,markAttendance);
// router.get('/',userAuth,adminAuth, getAttendance);
// // attendanceRoutes.js
// router.get('/summary', userAuth, superAdminAuth, getSummary);
// // router.get('/summary/today',userAuth,adminAuth, getTodaySummary);
// router.get('/superadmin/all', userAuth, superAdminAuth, getAttendanceSuperAdmin);
router.post('/mark', adminUserAuth, adminAuth, markAttendance);
router.get('/', adminUserAuth, adminAuth, getAttendance);

router.get('/summary', superAdminUserAuth, superAdminAuth, getSummary);
router.get('/superadmin/all', superAdminUserAuth, superAdminAuth, getAttendanceSuperAdmin)
// attendanceRoutes.js
// router.get('/export', userAuth, adminAuth, exportAttendance);
router.get('/export/superadmin', superAdminUserAuth, superAdminAuth, exportAttendanceSuperAdmin);
export default router;