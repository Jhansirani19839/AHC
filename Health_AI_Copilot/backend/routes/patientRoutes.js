const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/auth');
const { verifyPatientAccess } = require('../middleware/rbac');

router.use(authenticate);

// List authorized patients
router.get('/', patientController.getPatients);

// Get single patient profile
router.get('/:id', verifyPatientAccess, patientController.getPatientById);

// Get patient records & chronological timeline
router.get('/:id/records', verifyPatientAccess, patientController.getPatientRecords);

module.exports = router;
