import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'dashboard'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid #bfdbfe',
            borderTopColor: '#1d4ed8',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Initializing AI Health Copilot...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (view === 'login') {
      return <LoginPage onBackToLanding={() => setView('landing')} />;
    }
    return <LandingPage onLoginSuccess={() => setView('dashboard')} />;
  }

  // Logged in: Render role-specific dashboard with common Navbar
  return (
    <div className="app-container">
      <Navbar onNavigateLanding={() => setView('landing')} />
      <main className="dashboard-layout">
        {user.role === 'ADMIN' && <AdminDashboard />}
        {user.role === 'DOCTOR' && <DoctorDashboard />}
        {user.role === 'PATIENT' && <PatientDashboard />}
      </main>
    </div>
  );
}
