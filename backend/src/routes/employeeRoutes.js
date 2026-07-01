import express from 'express';
const router = express.Router();

import  verifyToken  from '../middleware/authMiddleware.js';
import  upload  from '../middleware/uploadMiddleware.js';

import { getAllEmployees, getEmployee, createEmployee,
    saveFaceDescriptor, deleteEmployee } from '../controllers/employeeController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
// router.use(verifyToken);

router.get('/', userAuth,adminAuth,getAllEmployees);
router.get('/:id',userAuth,adminAuth, getEmployee);
router.post('/', userAuth,adminAuth,upload.single('photo'), createEmployee);
router.patch('/:id/descriptor',userAuth,adminAuth, saveFaceDescriptor);
router.delete('/:id',userAuth,adminAuth, deleteEmployee);

export default router;