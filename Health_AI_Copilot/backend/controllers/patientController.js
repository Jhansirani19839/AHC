const db = require('../config/db');
const summaryService = require('../../ai/summaries/summaryService');

exports.getPatients = (req, res) => {
  try {
    let patients = [];

    if (req.user.role === 'ADMIN') {
      patients = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM medical_records WHERE patient_id = p.id) as record_count,
          (SELECT COUNT(*) FROM diagnostic_records WHERE patient_id = p.id AND is_flagged = 1) as flagged_count,
          (SELECT follow_up_date FROM follow_ups WHERE patient_id = p.id AND status = 'scheduled' ORDER BY follow_up_date ASC LIMIT 1) as next_follow_up
        FROM patients p
        ORDER BY p.patient_code ASC
      `).all();
    } else if (req.user.role === 'DOCTOR') {
      patients = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM medical_records WHERE patient_id = p.id) as record_count,
          (SELECT COUNT(*) FROM diagnostic_records WHERE patient_id = p.id AND is_flagged = 1) as flagged_count,
          (SELECT follow_up_date FROM follow_ups WHERE patient_id = p.id AND status = 'scheduled' ORDER BY follow_up_date ASC LIMIT 1) as next_follow_up
        FROM patients p
        INNER JOIN doctor_patient_assignments dpa ON dpa.patient_id = p.id
        WHERE dpa.doctor_id = ?
        ORDER BY p.patient_code ASC
      `).all(req.user.doctor_id);
    } else if (req.user.role === 'PATIENT') {
      patients = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM medical_records WHERE patient_id = p.id) as record_count,
          (SELECT COUNT(*) FROM diagnostic_records WHERE patient_id = p.id AND is_flagged = 1) as flagged_count,
          (SELECT follow_up_date FROM follow_ups WHERE patient_id = p.id AND status = 'scheduled' ORDER BY follow_up_date ASC LIMIT 1) as next_follow_up
        FROM patients p
        WHERE p.id = ?
      `).all(req.user.patient_id);
    }

    return res.json({ patients });
  } catch (err) {
    console.error('Error fetching patients:', err);
    return res.status(500).json({ error: 'Failed to retrieve patient registry.' });
  }
};

exports.getPatientById = (req, res) => {
  try {
    const patient = req.targetPatient;

    // Fetch assigned doctors
    const assignedDoctors = db.prepare(`
      SELECT d.id, d.doctor_code, d.name, d.email, d.department, d.specialization, d.phone
      FROM doctors d
      INNER JOIN doctor_patient_assignments dpa ON dpa.doctor_id = d.id
      WHERE dpa.patient_id = ?
    `).all(patient.id);

    // Fetch next scheduled follow-up
    const nextFollowUp = db.prepare(`
      SELECT f.*, d.name as doctor_name, d.doctor_code
      FROM follow_ups f
      LEFT JOIN doctors d ON d.id = f.doctor_id
      WHERE f.patient_id = ? AND f.status = 'scheduled'
      ORDER BY f.follow_up_date ASC
      LIMIT 1
    `).get(patient.id);

    // Fetch counts
    const recordCount = db.prepare('SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?').get(patient.id).count;
    const flaggedCount = db.prepare('SELECT COUNT(*) as count FROM diagnostic_records WHERE patient_id = ? AND is_flagged = 1').get(patient.id).count;

    return res.json({
      patient: {
        ...patient,
        assigned_doctors: assignedDoctors,
        next_follow_up: nextFollowUp || null,
        record_count: recordCount,
        flagged_count: flaggedCount
      }
    });
  } catch (err) {
    console.error('Error in getPatientById:', err);
    return res.status(500).json({ error: 'Failed to fetch patient details.' });
  }
};

exports.getPatientRecords = (req, res) => {
  try {
    const patient = req.targetPatient;

    // All medical records in chronological order for timeline
    const records = db.prepare(`
      SELECT r.*, d.name as doctor_name, d.doctor_code
      FROM medical_records r
      LEFT JOIN doctors d ON d.id = r.doctor_id
      WHERE r.patient_id = ?
      ORDER BY r.record_date ASC, r.id ASC
    `).all(patient.id);

    // Parse extracted JSON for each record
    const recordsWithDetails = records.map(rec => {
      let extractedData = {};
      try {
        if (rec.extracted_data_json) {
          extractedData = JSON.parse(rec.extracted_data_json);
        }
      } catch (e) {
        extractedData = {};
      }

      // Also get specific diagnostics for this record
      const diagnostics = db.prepare(`
        SELECT * FROM diagnostic_records
        WHERE medical_record_id = ?
        ORDER BY id ASC
      `).all(rec.id);

      // Get specific prescriptions for this record
      const prescriptions = db.prepare(`
        SELECT * FROM prescriptions
        WHERE medical_record_id = ?
        ORDER BY id ASC
      `).all(rec.id);

      return {
        ...rec,
        extracted_data: extractedData,
        diagnostics,
        prescriptions
      };
    });

    // All diagnostics for this patient
    const allDiagnostics = db.prepare(`
      SELECT * FROM diagnostic_records
      WHERE patient_id = ?
      ORDER BY test_date DESC, id DESC
    `).all(patient.id);

    // All prescriptions for this patient
    const allPrescriptions = db.prepare(`
      SELECT p.*, d.name as doctor_name
      FROM prescriptions p
      LEFT JOIN doctors d ON d.id = p.doctor_id
      WHERE p.patient_id = ?
      ORDER BY p.prescription_date DESC, p.id DESC
    `).all(patient.id);

    // Dynamic overall AI summary for patient
    const overallSummary = summaryService.generatePatientProfileSummary(
      patient,
      recordsWithDetails,
      allDiagnostics,
      allPrescriptions
    );

    return res.json({
      patient_id: patient.id,
      patient_code: patient.patient_code,
      timeline: recordsWithDetails,
      records: recordsWithDetails,
      diagnostics: allDiagnostics,
      prescriptions: allPrescriptions,
      overall_summary: overallSummary
    });
  } catch (err) {
    console.error('Error fetching patient records:', err);
    return res.status(500).json({ error: 'Failed to retrieve patient medical records.' });
  }
};
