const summaryService = require('../../ai/summaries/summaryService');
const chatbotService = require('../../ai/chatbot/chatbotService');
const comparisonService = require('../../ai/comparison/comparisonService');
const db = require('../config/db');

exports.getSummary = (req, res) => {
  try {
    const { record_id, patient_id } = req.body;

    if (record_id) {
      const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(record_id);
      if (!record) {
        return res.status(404).json({ error: 'Record not found.' });
      }
      const summary = summaryService.generateRecordSummary(record);
      return res.json({ summary });
    }

    if (patient_id) {
      const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patient_id, patient_id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found.' });
      }
      const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date ASC').all(patient.id);
      const diagnostics = db.prepare('SELECT * FROM diagnostic_records WHERE patient_id = ?').all(patient.id);
      const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ?').all(patient.id);

      const summary = summaryService.generatePatientProfileSummary(patient, records, diagnostics, prescriptions);
      return res.json({ summary });
    }

    return res.status(400).json({ error: 'Specify either record_id or patient_id.' });
  } catch (err) {
    console.error('Error generating summary:', err);
    return res.status(500).json({ error: 'Failed to generate AI health summary.' });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, patient_id, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message query is required.' });
    }

    // Determine target patient
    let patientId = patient_id;
    if (!patientId && req.user.role === 'PATIENT') {
      patientId = req.user.patient_id;
    }

    let patient = null;
    let records = [];
    let diagnostics = [];
    let prescriptions = [];

    if (patientId) {
      patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patientId, patientId);
      if (patient) {
        records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date ASC').all(patient.id);
        diagnostics = db.prepare('SELECT * FROM diagnostic_records WHERE patient_id = ? ORDER BY test_date DESC').all(patient.id);
        prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescription_date DESC').all(patient.id);
      }
    }

    const context = {
      patient,
      records,
      diagnostics,
      prescriptions
    };

    const chatResponse = await chatbotService.processChat(message, context, language || 'en');

    // Activity log for patient questions
    try {
      db.prepare(`
        INSERT INTO activity_logs (user_id, user_code, role, action, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        req.user.user_code,
        req.user.role,
        'AI_CHAT_INQUIRY',
        `User asked AI Copilot: "${message.slice(0, 50)}..."`
      );
    } catch (e) {
      // quiet log
    }

    return res.json(chatResponse);
  } catch (err) {
    console.error('AI Chatbot error:', err);
    return res.status(500).json({ error: 'Failed to process AI chat response.' });
  }
};

exports.compare = (req, res) => {
  try {
    const { previous_record_id, latest_record_id, patient_id } = req.body;

    let prevRecord;
    let latestRecord;

    if (previous_record_id && latest_record_id) {
      prevRecord = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(previous_record_id);
      latestRecord = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(latest_record_id);
    } else if (patient_id) {
      const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patient_id, patient_id);
      if (!patient) return res.status(404).json({ error: 'Patient not found.' });

      const labRecords = db.prepare(`
        SELECT * FROM medical_records
        WHERE patient_id = ? AND record_type IN ('Lab Report', 'Diagnostic Report')
        ORDER BY record_date ASC
      `).all(patient.id);

      if (labRecords.length < 2) {
        return res.status(400).json({ error: 'At least 2 laboratory records required for comparative trend analysis.' });
      }

      prevRecord = labRecords[0];
      latestRecord = labRecords[labRecords.length - 1];
    } else {
      return res.status(400).json({ error: 'Must provide record IDs or patient ID for comparison.' });
    }

    if (!prevRecord || !latestRecord) {
      return res.status(404).json({ error: 'One or both medical records could not be found.' });
    }

    // Attach tests to records
    prevRecord.tests = db.prepare('SELECT * FROM diagnostic_records WHERE medical_record_id = ?').all(prevRecord.id);
    latestRecord.tests = db.prepare('SELECT * FROM diagnostic_records WHERE medical_record_id = ?').all(latestRecord.id);

    const comparisonResult = comparisonService.compareReports(prevRecord, latestRecord);

    return res.json(comparisonResult);
  } catch (err) {
    console.error('Report comparison error:', err);
    return res.status(500).json({ error: 'Failed to execute comparative analysis.' });
  }
};
