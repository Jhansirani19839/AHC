const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

// Get follow-up reminders
router.get('/', followupController.getFollowUps);

// Doctor or Admin creates a follow-up reminder
router.post('/', requireRole('DOCTOR', 'ADMIN'), followupController.createFollowUp);

module.exports = router;
