const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please re-login.' });
  }

  // Fetch fresh user details
  const user = db.prepare('SELECT id, user_code, name, email, role FROM users WHERE id = ?').get(decoded.id);
  if (!user) {
    return res.status(401).json({ error: 'User account no longer exists.' });
  }

  // Attach linked doctor_id or patient_id if applicable
  if (user.role === 'DOCTOR') {
    const doc = db.prepare('SELECT id, doctor_code, department, specialization FROM doctors WHERE user_id = ?').get(user.id);
    user.doctor_id = doc ? doc.id : null;
    user.doctor_code = doc ? doc.doctor_code : null;
  } else if (user.role === 'PATIENT') {
    const pat = db.prepare('SELECT id, patient_code, abha_id, health_id FROM patients WHERE user_id = ?').get(user.id);
    user.patient_id = pat ? pat.id : null;
    user.patient_code = pat ? pat.patient_code : null;
  }

  req.user = user;
  next();
}

module.exports = authenticate;
