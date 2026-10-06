const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

// Doctor/Admin saves verified medical record
router.post('/', requireRole('DOCTOR', 'ADMIN'), recordController.createRecord);

// Get medical record by ID
router.get('/:id', recordController.getRecordById);

module.exports = router;
