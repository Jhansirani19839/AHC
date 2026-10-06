import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, Shield, FileText, Brain, Bot, Users, Calendar, ArrowRight, 
  CheckCircle, Lock, Award, HeartPulse, Globe, Sparkles 
} from 'lucide-react';
import SafeDisclaimer from '../components/SafeDisclaimer';

export default function LandingPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('DOCTOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo accounts specification from Section 6
  const demoUsers = {
    ADMIN: [
      { id: 'ADM-001', name: 'Hospital Admin', email: 'admin@paavaidemo.com', pass: 'Admin@123', desc: 'System Admin • All Access' }
    ],
    DOCTOR: [
      { id: 'DOC-001', name: 'Dr. Arun Kumar', email: 'arun@paavaidemo.com', pass: 'Doctor@123', desc: 'Internal Medicine (PAT-1001, PAT-1002)' },
      { id: 'DOC-002', name: 'Dr. Priya', email: 'priya@paavaidemo.com', pass: 'Doctor@123', desc: 'Cardiology (PAT-1001, PAT-1003)' },
      { id: 'DOC-003', name: 'Dr. Karthik', email: 'karthik@paavaidemo.com', pass: 'Doctor@123', desc: 'Endocrinology (PAT-1002, PAT-1004)' },
      { id: 'DOC-004', name: 'Dr. Meena', email: 'meena@paavaidemo.com', pass: 'Doctor@123', desc: 'Pathology & Diagnostics (PAT-1003, PAT-1004)' }
    ],
    PATIENT: [
      { id: 'PAT-1001', name: 'Demo Patient 1', email: 'patient1@paavaidemo.com', pass: 'Patient@123', desc: 'Male, 42 • Active Timeline with Blood Tests' },
      { id: 'PAT-1002', name: 'Demo Patient 2', email: 'patient2@paavaidemo.com', pass: 'Patient@123', desc: 'Female, 36 • Thyroid & Iron Panel' },
      { id: 'PAT-1003', name: 'Demo Patient 3', email: 'patient3@paavaidemo.com', pass: 'Patient@123', desc: 'Male, 58 • Cardiovascular & Lipid Profile' },
      { id: 'PAT-1004', name: 'Demo Patient 4', email: 'patient4@paavaidemo.com', pass: 'Patient@123', desc: 'Female, 29 • Wellness & Vitamin D3 Profile' }
    ]
  };

  const handleQuickLogin = async (userObj) => {
    setLoading(true);
    setError('');
    try {
      await login({ email: userObj.email, password: userObj.pass });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        padding: '16px 36px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e40af, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              AI Health Copilot
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Paavai Demo Hospital • 24h Hackathon Challenge
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <Globe size={15} color="var(--primary)" />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
          <a href="#quick-login" className="btn btn-primary btn-sm">
            <span>Explore Demo Sign-In</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '64px 36px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          backgroundColor: '#eff6ff',
          borderRadius: '20px',
          color: '#1e40af',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '20px',
          border: '1px solid #bfdbfe'
        }}>
          <Sparkles size={16} />
          <span>AI-Powered Personal Health Copilot</span>
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.2,
          marginBottom: '18px',
          letterSpacing: '-0.03em'
        }}>
          One Secure Health Profile for Every Patient,<br />
          <span style={{ color: 'var(--primary)' }}>Powered by OCR & Safe Clinical AI</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '780px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Transform scattered paper prescriptions, laboratory reports, and diagnostic records into a unified, easy-to-understand health timeline with doctor-verified OCR extraction and bilingual AI summaries.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <a href="#quick-login" className="btn btn-primary btn-lg" style={{ borderRadius: '8px' }}>
            <span>Test Live Prototype Roles</span>
            <ArrowRight size={18} />
          </a>
          <a href="#problem-solution" className="btn btn-secondary btn-lg" style={{ borderRadius: '8px' }}>
            <span>Problem & Architecture</span>
          </a>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {[
            'Document OCR Pipeline',
            'Doctor Verification',
            'Safe AI Health Summaries',
            'Chronological Timeline',
            'Ask Copilot Chatbot',
            'Tamil (தமிழ்) Explanations',
            'Report Comparison Delta',
            'Follow-up Reminders',
            'ABDM & FHIR Ready'
          ].map((feat, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-muted)'
              }}
            >
              ✓ {feat}
            </span>
          ))}
        </div>
      </section>

      {/* QUICK LOGIN SECTION */}
      <section id="quick-login" style={{
        backgroundColor: '#f8fafc',
        padding: '50px 36px',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              One-Click Hackathon Demo Login
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Select a role below to instantly authenticate and evaluate the Paavai Demo Hospital workflow.
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedRole('DOCTOR')}
              className={`btn ${selectedRole === 'DOCTOR' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 24px', fontWeight: 600 }}
            >
              Doctors (4 Demo Accounts)
            </button>
            <button
              onClick={() => setSelectedRole('PATIENT')}
              className={`btn ${selectedRole === 'PATIENT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 24px', fontWeight: 600 }}
            >
              Patients (4 Demo Accounts)
            </button>
            <button
              onClick={() => setSelectedRole('ADMIN')}
              className={`btn ${selectedRole === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 24px', fontWeight: 600 }}
            >
              Hospital Admin
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Role Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {demoUsers[selectedRole].map((u) => (
              <div
                key={u.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {u.id}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {selectedRole}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {u.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {u.desc}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '4px', marginBottom: '14px' }}>
                    <div><strong>Email:</strong> {u.email}</div>
                    <div><strong>Password:</strong> {u.pass}</div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  disabled={loading}
                  onClick={() => handleQuickLogin(u)}
                >
                  <span>Sign In as {u.name}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION SECTION */}
      <section id="problem-solution" style={{ padding: '60px 36px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          {/* Problem */}
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9b2c2c', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={22} color="#e53e3e" />
              The Healthcare Challenge
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#742a2a', lineHeight: 1.7 }}>
              <li>Medical records are scattered across prescriptions, lab reports, discharge summaries, and diagnostic tests.</li>
              <li>Patients find technical medical terminology difficult to understand without clinical background.</li>
              <li>Healthcare professionals spend valuable consultation time piecing together disparate documents.</li>
            </ul>
          </div>

          {/* Solution */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} color="#16a34a" />
              The AI Health Copilot Solution
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#14532d', lineHeight: 1.7 }}>
              <li>Unified patient health profile powered by structured OCR extraction and chronological timeline sequencing.</li>
              <li>Doctor verification checkpoint before saving ensures clinical safety and zero autonomous errors.</li>
              <li>Context-aware AI Health Copilot delivers plain-language explanations in both English and Tamil.</li>
            </ul>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            How Document Processing Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            A rigorous 6-stage clinical architecture designed for safety and speed.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          textAlign: 'center',
          marginBottom: '36px'
        }}>
          {[
            { step: '1', title: 'Upload', desc: 'Blood report, Rx, or Diagnostic file' },
            { step: '2', title: 'OCR Processing', desc: 'Character recognition & layout parsing' },
            { step: '3', title: 'Field Extraction', desc: 'Identifies tests, units, and ranges' },
            { step: '4', title: 'Validation', desc: 'Flags values outside reference bounds' },
            { step: '5', title: 'Doctor Verification', desc: 'Physician reviews & confirms' },
            { step: '6', title: 'AI Summary & Timeline', desc: 'Safe explanations in EN and தமிழ்' }
          ].map((s, idx) => (
            <div key={idx} style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px 12px',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {s.step}
              </div>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>{s.title}</h5>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <SafeDisclaimer />
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '24px 36px',
        textAlign: 'center',
        fontSize: '0.82rem'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'white' }}>AI Health Copilot</strong> • Paavai Demo Hospital Prototype
          </div>
          <div>
            ABDM / ABHA Future-Ready Architecture • FHIR Resource Aligned
          </div>
        </div>
      </footer>
    </div>
  );
}
