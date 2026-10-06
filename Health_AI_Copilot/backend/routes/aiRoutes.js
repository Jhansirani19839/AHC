const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// Generate record or patient summary
router.post('/summary', aiController.getSummary);

// Chat with AI Health Copilot
router.post('/chat', aiController.chat);

// Compare two reports (Previous vs Latest)
router.post('/compare', aiController.compare);

module.exports = router;
