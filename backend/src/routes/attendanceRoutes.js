import express from 'express';
const router = express.Router();

import { markAttendance, getAttendance, getTodaySummary } from '../controllers/attendanceController.js';
import  verifyToken  from '../middleware/authMiddleware.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

// router.use(verifyToken);

router.post('/mark', userAuth,adminAuth,markAttendance);
router.get('/',userAuth,adminAuth, getAttendance);
router.get('/summary/today',userAuth,adminAuth, getTodaySummary);

export default router;