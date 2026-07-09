import express from 'express';
const router = express.Router();

// import  verifyToken  from '../middleware/authMiddleware.js';
import   { uploadEmployeePhoto }  from '../middleware/uploadMiddleware.js';

import { getAllEmployees, getEmployee, createEmployee,
    saveFaceDescriptor, deleteEmployee, 
    updateEmployee,
    getAllEmployeesSuperAdmin,
    
    getAllEmployeesForMatching,
    getEmployeeByAadhar,
    getAllAdmins} from '../controllers/employeeController.js';
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
import operatorUserAuth from '../middleware/operatorUserAuth.js';
import operatorAuth from '../middleware/operatorAuth.js';

// Admin-only (own employees)
//router.get('/', adminUserAuth, adminAuth, getAllEmployees);
router.get('/', operatorUserAuth, operatorAuth, getAllEmployees);
router.get('/:id', adminUserAuth, adminAuth, getEmployee);
// router.post('/', adminUserAuth, adminAuth, uploadEmployeePhoto,createEmployee);
// router.put('/:id', adminUserAuth, adminAuth,uploadEmployeePhoto, updateEmployee);
// router.delete('/:id', adminUserAuth, adminAuth, deleteEmployee);


router.post('/', operatorUserAuth, operatorAuth, uploadEmployeePhoto,createEmployee);
router.put('/:id', operatorUserAuth, operatorAuth,uploadEmployeePhoto, updateEmployee);
router.delete('/:id',operatorUserAuth, operatorAuth, deleteEmployee);
// employeeRoutes.js
router.get('/match/all', adminUserAuth, adminAuth, getAllEmployeesForMatching);
// Superadmin-only (read-only, all admins)
// employeeRoutes.js
router.get('/aadhar/:aadhar', adminUserAuth, adminAuth, getEmployeeByAadhar);
router.get('/superadmin/all', superAdminUserAuth, superAdminAuth, getAllEmployeesSuperAdmin);
router.get('/superadmin/admins', superAdminUserAuth, superAdminAuth, getAllAdmins);

export default router;