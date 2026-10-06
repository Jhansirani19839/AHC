const documentProcessor = require('../../ocr/document-processing/documentProcessor');
const fieldExtractor = require('../../ocr/extraction/fieldExtractor');
const validationService = require('../../ocr/validation/validationService');
const db = require('../config/db');

exports.processDocument = async (req, res) => {
  try {
    const file = req.file;
    const { document_type, patient_id } = req.body;

    let patient = null;
    if (patient_id) {
      patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patient_id, patient_id);
    }

    // Step 1 & 2: Process document and simulate OCR text extraction
    const ocrResult = await documentProcessor.processDocument(file, document_type);

    // Step 3: Extract structured fields
    const extractedData = fieldExtractor.extractFields(ocrResult.rawOcrText, ocrResult.documentType, patient);

    // Step 4: Validate extracted fields against reference ranges
    const validatedData = validationService.validateExtractedData(extractedData);

    return res.json({
      success: true,
      pipeline: {
        ocr: ocrResult,
        extracted: extractedData,
        validated: validatedData,
        stage: 'WAITING_FOR_DOCTOR_VERIFICATION'
      }
    });
  } catch (err) {
    console.error('OCR Processing error:', err);
    return res.status(500).json({ error: 'OCR Document processing failed.' });
  }
};
