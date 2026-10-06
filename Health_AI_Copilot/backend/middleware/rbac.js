const db = require('../config/db');

/**
 * Require specific roles
 * @param  {...string} roles - Allowed roles (e.g. 'ADMIN', 'DOCTOR')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${roles.join(', ')}.`
      });
    }
    next();
  };
}

/**
 * Check if the current user is authorized to access a given patient's records
 * - ADMIN has access to all patients
 * - DOCTOR has access ONLY if assigned to this patient
 * - PATIENT has access ONLY if patient_id matches their own
 */
function verifyPatientAccess(req, res, next) {
  const patientParam = req.params.id || req.params.patientId || req.body.patient_id;
  if (!patientParam) {
    return res.status(400).json({ error: 'Patient identifier is required.' });
  }

  // Lookup target patient by either numeric id or patient_code (e.g. PAT-1001)
  let targetPatient;
  if (!isNaN(patientParam)) {
    targetPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientParam);
  } else {
    targetPatient = db.prepare('SELECT * FROM patients WHERE patient_code = ?').get(patientParam);
  }

  if (!targetPatient) {
    return res.status(404).json({ error: 'Patient not found in Paavai Demo Hospital registry.' });
  }

  req.targetPatient = targetPatient;

  // Role checks
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role === 'PATIENT') {
    if (req.user.patient_id !== targetPatient.id) {
      return res.status(403).json({ error: 'Access denied. Patients may only view their own medical profile.' });
    }
    return next();
  }

  if (req.user.role === 'DOCTOR') {
    // Check doctor-patient assignment table
    const assignment = db.prepare(`
      SELECT id FROM doctor_patient_assignments
      WHERE doctor_id = ? AND patient_id = ?
    `).get(req.user.doctor_id, targetPatient.id);

    if (!assignment) {
      return res.status(403).json({
        error: `Access restricted: Dr. ${req.user.name} is not authorized for patient ${targetPatient.patient_code} (${targetPatient.name}).`
      });
    }
    return next();
  }

  return res.status(403).json({ error: 'Access unauthorized.' });
}

module.exports = {
  requireRole,
  verifyPatientAccess
};
