const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');

exports.login = (req, res) => {
  try {
    const { email, user_code, password } = req.body;

    if ((!email && !user_code) || !password) {
      return res.status(400).json({ error: 'Email/User ID and password are required.' });
    }

    let user;
    if (email) {
      user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    } else {
      user = db.prepare('SELECT * FROM users WHERE UPPER(user_code) = UPPER(?)').get(user_code.trim());
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your demo login.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check credentials.' });
    }

    // Role-specific data
    let doctorProfile = null;
    let patientProfile = null;

    if (user.role === 'DOCTOR') {
      doctorProfile = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
    } else if (user.role === 'PATIENT') {
      patientProfile = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
    }

    const tokenPayload = {
      id: user.id,
      user_code: user.user_code,
      role: user.role,
      name: user.name,
      email: user.email
    };

    const token = generateToken(tokenPayload);

    // Log login activity
    try {
      db.prepare(`
        INSERT INTO activity_logs (user_id, user_code, role, action, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(user.id, user.user_code, user.role, 'USER_LOGIN', `User ${user.user_code} signed in successfully.`);
    } catch (e) {
      console.error('Failed to log activity:', e.message);
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        user_code: user.user_code,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor: doctorProfile,
        patient: patientProfile
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

exports.getCurrentUser = (req, res) => {
  try {
    let doctorProfile = null;
    let patientProfile = null;

    if (req.user.role === 'DOCTOR') {
      doctorProfile = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(req.user.id);
    } else if (req.user.role === 'PATIENT') {
      patientProfile = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(req.user.id);
    }

    return res.json({
      user: {
        ...req.user,
        doctor: doctorProfile,
        patient: patientProfile
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch current user profile.' });
  }
};
