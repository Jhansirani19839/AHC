const db = require('../config/db');
const summaryService = require('../../ai/summaries/summaryService');

exports.createRecord = (req, res) => {
  try {
    const {
      patient_id,
      record_type,
      title,
      record_date,
      file_name,
      file_path,
      ocr_raw_text,
      extracted_data,
      is_verified
    } = req.body;

    if (!patient_id || !record_type || !title) {
      return res.status(400).json({ error: 'Patient ID, record type, and title are required.' });
    }

    // Lookup patient
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patient_id, patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Role check: Only Doctor or Admin can verify & save
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only healthcare professionals or administrators can save medical records.' });
    }

    // Generate unique record code
    const count = db.prepare('SELECT COUNT(*) as count FROM medical_records').get().count;
    const recordCode = `REC-${patient.patient_code.replace('PAT-', '')}-${String(count + 1).padStart(2, '0')}`;

    // Generate AI Summary for this record
    const summary = summaryService.generateRecordSummary({
      record_type,
      tests: extracted_data?.tests || [],
      medications: extracted_data?.medications || []
    });

    const fhirType = record_type === 'Prescription' ? 'MedicationRequest' : 
                     record_type === 'Discharge Summary' ? 'Encounter' : 
                     'DiagnosticReport';

    const insertRecord = db.prepare(`
      INSERT INTO medical_records (
        record_code, patient_id, doctor_id, record_type, title, record_date,
        file_name, file_path, ocr_raw_text, extracted_data_json,
        is_verified, verified_by_doctor_id, verified_at,
        ai_summary, ai_summary_ta, fhir_resource_type, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertRecord.run(
      recordCode,
      patient.id,
      req.user.doctor_id || null,
      record_type,
      title,
      record_date || new Date().toISOString().slice(0, 10),
      file_name || 'uploaded_document.pdf',
      file_path || 'uploads/sample_report.pdf',
      ocr_raw_text || '',
      JSON.stringify(extracted_data || {}),
      is_verified ? 1 : 0,
      req.user.doctor_id || null,
      is_verified ? new Date().toISOString() : null,
      summary.en,
      summary.ta,
      fhirType,
      is_verified ? 'verified' : 'pending_review'
    );

    const recordId = result.lastInsertRowid;

    // Insert diagnostics if tests exist
    if (Array.isArray(extracted_data?.tests)) {
      const insertDiag = db.prepare(`
        INSERT INTO diagnostic_records (
          medical_record_id, patient_id, test_name, test_value, test_value_display,
          unit, reference_range, is_flagged, flag_reason, test_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      extracted_data.tests.forEach(t => {
        insertDiag.run(
          recordId,
          patient.id,
          t.test_name,
          isNaN(parseFloat(t.test_value)) ? null : parseFloat(t.test_value),
          String(t.test_value_display || t.test_value),
          t.unit || '',
          t.reference_range || '',
          t.is_flagged ? 1 : 0,
          t.flag_reason || null,
          record_date || new Date().toISOString().slice(0, 10)
        );
      });
    }

    // Insert prescriptions if medications exist
    if (Array.isArray(extracted_data?.medications)) {
      const insertPresc = db.prepare(`
        INSERT INTO prescriptions (
          medical_record_id, patient_id, doctor_id, medication_name,
          dosage, frequency, duration, instructions, instructions_ta, prescription_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      extracted_data.medications.forEach(m => {
        insertPresc.run(
          recordId,
          patient.id,
          req.user.doctor_id || null,
          m.medication_name,
          m.dosage || 'Standard dose',
          m.frequency || 'As directed',
          m.duration || '30 days',
          m.instructions || 'Take as advised by doctor',
          m.instructions_ta || 'மருத்துவர் அறிவுறுத்தியபடி எடுத்துக்கொள்ளவும்',
          record_date || new Date().toISOString().slice(0, 10)
        );
      });
    }

    // Log Activity
    try {
      db.prepare(`
        INSERT INTO activity_logs (user_id, user_code, role, action, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        req.user.user_code,
        req.user.role,
        'RECORD_VERIFIED_AND_SAVED',
        `Doctor ${req.user.name} verified and saved ${record_type} (${recordCode}) for patient ${patient.patient_code}.`
      );
    } catch (e) {
      console.error('Log error:', e.message);
    }

    // Fetch newly created record
    const savedRecord = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(recordId);

    return res.status(201).json({
      message: 'Medical record verified and saved successfully to patient timeline.',
      record: savedRecord,
      summary
    });
  } catch (err) {
    console.error('Error creating record:', err);
    return res.status(500).json({ error: 'Failed to save verified medical record.' });
  }
};

exports.getRecordById = (req, res) => {
  try {
    const { id } = req.params;
    const record = db.prepare(`
      SELECT r.*, d.name as doctor_name, d.doctor_code, p.name as patient_name, p.patient_code
      FROM medical_records r
      LEFT JOIN doctors d ON d.id = r.doctor_id
      LEFT JOIN patients p ON p.id = r.patient_id
      WHERE r.id = ?
    `).get(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const diagnostics = db.prepare('SELECT * FROM diagnostic_records WHERE medical_record_id = ?').all(record.id);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE medical_record_id = ?').all(record.id);

    return res.json({
      record: {
        ...record,
        extracted_data: record.extracted_data_json ? JSON.parse(record.extracted_data_json) : {},
        diagnostics,
        prescriptions
      }
    });
  } catch (err) {
    console.error('Error fetching record:', err);
    return res.status(500).json({ error: 'Failed to fetch medical record.' });
  }
};
