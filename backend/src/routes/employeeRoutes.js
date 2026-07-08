import express from 'express';
const router = express.Router();

// import  verifyToken  from '../middleware/authMiddleware.js';
import   { uploadEmployeePhoto }  from '../middleware/uploadMiddleware.js';

import { getAllEmployees, getEmployee, createEmployee,
    saveFaceDescriptor, deleteEmployee, 
    updateEmployee,
    getAllEmployeesSuperAdmin,
    
    getAllEmployeesForMatching,
    getEmployeeByAadhar} from '../controllers/employeeController.js';
// import userAuth from '../middleware/userAuth.js';
// import adminAuth from '../middleware/adminAuth.js';
// import superAdminAuth from '../middleware/superAdminAuth.js';
// // router.use(verifyToken);

// router.get('/', userAuth,adminAuth,getAllEmployees);
// router.get('/:id',userAuth,adminAuth, getEmployee);
// //router.post('/', userAuth,adminAuth,upload.single('photo'), createEmployee);
// router.post('/', userAuth,adminAuth,uploadEmployeePhoto, createEmployee);
// router.patch('/:id/descriptor',userAuth,adminAuth, saveFaceDescriptor);
// router.put('/:id',userAuth,adminAuth,uploadEmployeePhoto, updateEmployee);
// router.delete('/:id',userAuth,adminAuth, deleteEmployee);

//  //Superadmin-only (read-only, all admins)
// router.get('/superadmin/all', userAuth, superAdminAuth, getAllEmployeesSuperAdmin);
// router.get('/superadmin/admins', userAuth, superAdminAuth, getAllAdmins);

import adminUserAuth from '../middleware/adminUserAuth.js';
import superAdminUserAuth from '../middleware/superAdminUserAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import superAdminAuth from '../middleware/superAdminAuth.js';

// Admin-only (own employees)
router.get('/', adminUserAuth, adminAuth, getAllEmployees);
router.get('/:id', adminUserAuth, adminAuth, getEmployee);
router.post('/', adminUserAuth, adminAuth, uploadEmployeePhoto,createEmployee);
router.put('/:id', adminUserAuth, adminAuth,uploadEmployeePhoto, updateEmployee);
router.delete('/:id', adminUserAuth, adminAuth, deleteEmployee);
// employeeRoutes.js
router.get('/match/all', adminUserAuth, adminAuth, getAllEmployeesForMatching);
// Superadmin-only (read-only, all admins)
// employeeRoutes.js
router.get('/aadhar/:aadhar', adminUserAuth, adminAuth, getEmployeeByAadhar);
router.get('/superadmin/all', superAdminUserAuth, superAdminAuth, getAllEmployeesSuperAdmin);
//router.get('/superadmin/admins', superAdminUserAuth, superAdminAuth, getAllAdmins);

export default router;