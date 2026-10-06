import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Globe, LogOut, Shield, User } from 'lucide-react';

export default function Navbar({ onNavigateLanding }) {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-warning">Admin</span>;
      case 'DOCTOR':
        return <span className="badge badge-blue">Doctor</span>;
      case 'PATIENT':
        return <span className="badge badge-normal">Patient</span>;
      default:
        return null;
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: onNavigateLanding ? 'pointer' : 'default' }}
        onClick={onNavigateLanding}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #1e40af, #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Activity size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              AI Health Copilot
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}>
              PROTOTYPE
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {t('hospitalName')} • Paavai Demo Hospital
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="btn btn-secondary btn-sm"
          title="Switch between English and Tamil"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
        >
          <Globe size={15} color="var(--primary)" />
          <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user.user_code} • {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fff5f5' }}
              title="Logout"
            >
              <LogOut size={15} />
              <span>{t('logout')}</span>
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hackathon Live Demo
          </span>
        )}
      </div>
    </header>
  );
}
