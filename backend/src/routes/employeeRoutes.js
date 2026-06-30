import express from 'express';
const router = express.Router();

import  verifyToken  from '../middleware/authMiddleware.js';
import  upload  from '../middleware/uploadMiddleware.js';

import { getAllEmployees, getEmployee, createEmployee,
    saveFaceDescriptor, deleteEmployee } from '../controllers/employeeController.js';
// router.use(verifyToken);

router.get('/', getAllEmployees);
router.get('/:id', getEmployee);
router.post('/', upload.single('photo'), createEmployee);
router.patch('/:id/descriptor', saveFaceDescriptor);
router.delete('/:id', deleteEmployee);

export default router;