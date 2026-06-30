import express from 'express';
const router = express.Router();

import { markAttendance, getAttendance, getTodaySummary } from '../controllers/attendanceController.js';
import  verifyToken  from '../middleware/authMiddleware.js';

// router.use(verifyToken);

router.post('/mark', markAttendance);
router.get('/', getAttendance);
router.get('/summary/today', getTodaySummary);

export default router;