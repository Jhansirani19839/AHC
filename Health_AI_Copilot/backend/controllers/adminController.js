const db = require('../config/db');

exports.getStats = (req, res) => {
  try {
    const totalDoctors = db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const totalRecords = db.prepare('SELECT COUNT(*) as count FROM medical_records').get().count;
    const totalFlagged = db.prepare('SELECT COUNT(*) as count FROM diagnostic_records WHERE is_flagged = 1').get().count;
    const totalPrescriptions = db.prepare('SELECT COUNT(*) as count FROM prescriptions').get().count;
    const totalScheduledFollowups = db.prepare("SELECT COUNT(*) as count FROM follow_ups WHERE status = 'scheduled'").get().count;

    return res.json({
      stats: {
        total_doctors: totalDoctors,
        total_patients: totalPatients,
        total_records: totalRecords,
        total_flagged_parameters: totalFlagged,
        total_prescriptions: totalPrescriptions,
        total_scheduled_followups: totalScheduledFollowups,
        hospital_name: 'Paavai Demo Hospital',
        system_status: 'HEALTHY',
        ocr_pipeline_status: 'OPERATIONAL',
        ai_services_status: 'ACTIVE_DEMO_ENGINE',
        last_sync: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
};

exports.getActivity = (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM activity_logs
      ORDER BY id DESC
      LIMIT 50
    `).all();

    return res.json({ logs });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit activity logs.' });
  }
};

exports.getUsersMatrix = (req, res) => {
  try {
    const doctors = db.prepare(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM doctor_patient_assignments WHERE doctor_id = d.id) as assigned_patient_count
      FROM doctors d
      ORDER BY d.doctor_code ASC
    `).all();

    const patients = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM medical_records WHERE patient_id = p.id) as record_count,
        (SELECT COUNT(*) FROM diagnostic_records WHERE patient_id = p.id AND is_flagged = 1) as flagged_count
      FROM patients p
      ORDER BY p.patient_code ASC
    `).all();

    // Attach assignments to patients
    const patientsWithDocs = patients.map(pat => {
      const assignedDocs = db.prepare(`
        SELECT d.id, d.doctor_code, d.name, d.department
        FROM doctors d
        JOIN doctor_patient_assignments dpa ON dpa.doctor_id = d.id
        WHERE dpa.patient_id = ?
      `).all(pat.id);

      return {
        ...pat,
        assigned_doctors: assignedDocs
      };
    });

    // Attach assignments to doctors
    const doctorsWithPatients = doctors.map(doc => {
      const assignedPats = db.prepare(`
        SELECT p.id, p.patient_code, p.name, p.age, p.gender
        FROM patients p
        JOIN doctor_patient_assignments dpa ON dpa.patient_id = p.id
        WHERE dpa.doctor_id = ?
      `).all(doc.id);

      return {
        ...doc,
        assigned_patients: assignedPats
      };
    });

    return res.json({
      doctors: doctorsWithPatients,
      patients: patientsWithDocs
    });
  } catch (err) {
    console.error('Error fetching users matrix:', err);
    return res.status(500).json({ error: 'Failed to retrieve user authorization matrix.' });
  }
};

exports.assignDoctorPatient = (req, res) => {
  try {
    const { doctor_id, patient_id } = req.body;

    if (!doctor_id || !patient_id) {
      return res.status(400).json({ error: 'doctor_id and patient_id are required.' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO doctor_patient_assignments (doctor_id, patient_id)
      VALUES (?, ?)
    `).run(doctor_id, patient_id);

    return res.json({ message: 'Assignment updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update assignment.' });
  }
};
