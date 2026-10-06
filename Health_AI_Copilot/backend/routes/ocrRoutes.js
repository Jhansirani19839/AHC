const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

// Document OCR Pipeline processing (Upload -> OCR -> Extract -> Validate)
router.post('/process', requireRole('DOCTOR', 'ADMIN'), upload.single('file'), ocrController.processDocument);

module.exports = router;
