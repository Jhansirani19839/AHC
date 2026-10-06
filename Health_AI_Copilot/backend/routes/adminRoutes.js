const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);
router.use(requireRole('ADMIN'));

// Administrative metrics
router.get('/stats', adminController.getStats);

// Audit activity logs
router.get('/activity', adminController.getActivity);

// Users Matrix (Doctors & Patients lists with assignments)
router.get('/matrix', adminController.getUsersMatrix);

// Assign doctor to patient
router.post('/assign', adminController.assignDoctorPatient);

module.exports = router;
