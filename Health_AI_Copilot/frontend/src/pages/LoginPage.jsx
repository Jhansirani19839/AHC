import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import SafeDisclaimer from '../components/SafeDisclaimer';

export default function LoginPage({ onBackToLanding }) {
  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const [identifier, setIdentifier] = useState('arun@paavaidemo.com');
  const [password, setPassword] = useState('Doctor@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, password } : { user_code: identifier, password };
      await login(payload);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '36px 32px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e40af, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 12px'
          }}>
            <HeartPulse size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
            AI Health Copilot
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Paavai Demo Hospital • Secure Sign In
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.825rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or User ID</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. arun@paavaidemo.com or DOC-001"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '8px' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Autofill Chips */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Quick Demo Autofill:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="suggestion-chip"
              onClick={() => fillCredentials('arun@paavaidemo.com', 'Doctor@123')}
            >
              Dr. Arun (DOC-001)
            </button>
            <button
              type="button"
              className="suggestion-chip"
              onClick={() => fillCredentials('patient1@paavaidemo.com', 'Patient@123')}
            >
              Patient 1 (PAT-1001)
            </button>
            <button
              type="button"
              className="suggestion-chip"
              onClick={() => fillCredentials('admin@paavaidemo.com', 'Admin@123')}
            >
              Admin (ADM-001)
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={onBackToLanding}
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}
          >
            ← Back to Landing Page
          </button>
        </div>

        <SafeDisclaimer compact />
      </div>
    </div>
  );
}
