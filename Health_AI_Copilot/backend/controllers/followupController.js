const db = require('../config/db');

exports.getFollowUps = (req, res) => {
  try {
    const { patient_id } = req.query;

    let query = `
      SELECT f.*, p.name as patient_name, p.patient_code, d.name as doctor_name, d.doctor_code
      FROM follow_ups f
      JOIN patients p ON p.id = f.patient_id
      LEFT JOIN doctors d ON d.id = f.doctor_id
    `;
    const params = [];

    if (patient_id) {
      query += ` WHERE f.patient_id = ?`;
      params.push(patient_id);
    } else if (req.user.role === 'PATIENT') {
      query += ` WHERE f.patient_id = ?`;
      params.push(req.user.patient_id);
    } else if (req.user.role === 'DOCTOR') {
      query += ` WHERE f.doctor_id = ?`;
      params.push(req.user.doctor_id);
    }

    query += ` ORDER BY f.follow_up_date ASC`;

    const followups = db.prepare(query).all(...params);
    return res.json({ followups });
  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    return res.status(500).json({ error: 'Failed to retrieve follow-up records.' });
  }
};

exports.createFollowUp = (req, res) => {
  try {
    const { patient_id, follow_up_date, notes, notes_ta } = req.body;

    if (!patient_id || !follow_up_date) {
      return res.status(400).json({ error: 'Patient ID and follow-up date are required.' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_code = ?').get(patient_id, patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const doctorId = req.user.doctor_id || null;

    const result = db.prepare(`
      INSERT INTO follow_ups (patient_id, doctor_id, follow_up_date, notes, notes_ta, status)
      VALUES (?, ?, ?, ?, ?, 'scheduled')
    `).run(patient.id, doctorId, follow_up_date, notes || 'Routine clinical follow-up', notes_ta || 'வழக்கமான மருத்துவ மறுபரிசோதனை');

    // Activity log
    try {
      db.prepare(`
        INSERT INTO activity_logs (user_id, user_code, role, action, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        req.user.user_code,
        req.user.role,
        'FOLLOWUP_SCHEDULED',
        `Scheduled follow-up for patient ${patient.patient_code} on ${follow_up_date}.`
      );
    } catch (e) {}

    const newFollowUp = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      message: 'Follow-up scheduled successfully.',
      followup: newFollowUp
    });
  } catch (err) {
    console.error('Error creating follow-up:', err);
    return res.status(500).json({ error: 'Failed to schedule follow-up.' });
  }
};
