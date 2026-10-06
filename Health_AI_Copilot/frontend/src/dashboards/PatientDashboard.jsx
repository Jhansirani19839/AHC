import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  User, Calendar, Clock, FileText, Pill, Activity, BarChart2, 
  Bot, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, ChevronRight, ShieldCheck 
} from 'lucide-react';
import Timeline from '../components/Timeline';
import Chatbot from '../components/Chatbot';
import ReportComparison from '../components/ReportComparison';
import SafeDisclaimer from '../components/SafeDisclaimer';
import AbhaBadge from '../components/AbhaBadge';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [recordsData, setRecordsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'timeline' | 'chat' | 'compare' | 'prescriptions'

  useEffect(() => {
    fetchMyRecords();
  }, [user]);

  const fetchMyRecords = async () => {
    setLoading(true);
    try {
      // Patient ID from authenticated session
      const patientId = user?.patient?.id || user?.patient_id || 'PAT-1001';
      const data = await api.getPatientRecords(patientId);
      setRecordsData(data);
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextFollowup = recordsData?.timeline?.find(r => r.next_follow_up) || {
    follow_up_date: '2026-10-20',
    doctor_name: 'Dr. Arun Kumar',
    notes: 'Review blood glucose control and dietary adjustments'
  };

  const flaggedItems = recordsData?.diagnostics?.filter(d => d.is_flagged === 1) || [];

  return (
    <div className="main-content">
      {/* Patient Welcome Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px' }}>
                PATIENT PORTAL
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {user.user_code} • Paavai Demo Hospital
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {lang === 'ta' ? `வணக்கம், ${user.name}` : `Welcome back, ${user.name}`}
            </h2>
            <div style={{ marginTop: '4px' }}>
              <AbhaBadge patient={user.patient} showInfoBox={false} />
            </div>
          </div>
        </div>

        {/* FOLLOW-UP REMINDER CARD */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('followup')}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
              20 October 2026
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
              Dr. Arun Kumar (Internal Medicine)
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATIC AI HEALTH SUMMARY BANNER (AUTOMATICALLY SEEN AFTER LOGIN) */}
      {recordsData?.overall_summary && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderLeft: '5px solid #16a34a',
          borderRadius: 'var(--radius)',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#16a34a" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534', margin: 0 }}>
                {lang === 'ta' ? 'உங்கள் தானியங்கி AI சுகாதாரச் சுருக்கம்' : 'Your Automated AI Health Summary'}
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
              {lang === 'ta' ? 'தமிழ் பதிப்பு' : 'English View'}
            </span>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#14532d', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {lang === 'ta'
              ? recordsData.overall_summary.ta?.split('\n\n⚠️')[0]
              : recordsData.overall_summary.en?.split('\n\n⚠️')[0]}
          </p>

          {flaggedItems.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#991b1b' }}>
                {lang === 'ta' ? 'மறுஆய்வுக்கு பரிந்துரைக்கப்பட்ட அளவுகள்:' : 'Parameters Flagged for Review:'}
              </span>
              {flaggedItems.map(f => (
                <span key={f.id} className="badge badge-flagged" style={{ fontSize: '0.72rem' }}>
                  ⚠️ {f.test_name}: {f.test_value} {f.unit}
                </span>
              ))}
            </div>
          )}

          <SafeDisclaimer compact />
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'summary', label: 'Overview & Summary', icon: Sparkles },
          { id: 'timeline', label: `Health Timeline (${recordsData?.timeline?.length || 0})`, icon: FileText },
          { id: 'chat', label: 'Ask AI Health Copilot', icon: Bot },
          { id: 'compare', label: 'Compare Reports', icon: BarChart2 },
          { id: 'prescriptions', label: `Prescriptions (${recordsData?.prescriptions?.length || 0})`, icon: Pill }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                background: 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Recent Reports Highlights */}
          <div className="card">
            <h3 className="card-title">
              <FileText size={18} color="var(--primary)" />
              <span>Latest Medical Reports</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recordsData?.timeline?.slice(-3).reverse().map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                      {r.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.record_date} • {r.record_type}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chatbot preview shortcut card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="card-title">
                <Bot size={18} color="var(--accent)" />
                <span>Ask AI Health Copilot</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                Have questions about your lab report results, medical terminology, or medicines? Ask our AI assistant for explanations in simple English or Tamil.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                <span className="suggestion-chip" onClick={() => setActiveTab('chat')}>Explain latest report</span>
                <span className="suggestion-chip" onClick={() => setActiveTab('chat')}>What is glucose?</span>
                <span className="suggestion-chip" onClick={() => setActiveTab('chat')}>தமிழில் விளக்கு</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('chat')}
              className="btn btn-primary"
              style={{ marginTop: '16px', width: '100%' }}
            >
              <Bot size={16} />
              <span>Open Chat Assistant</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={18} color="var(--primary)" />
              <span>Your Chronological Health Timeline</span>
            </h3>
            <button onClick={fetchMyRecords} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
          <Timeline records={recordsData?.timeline || []} />
        </div>
      )}

      {/* TAB 3: CHATBOT */}
      {activeTab === 'chat' && (
        <Chatbot patientId={user?.patient?.id || user?.patient_id || 'PAT-1001'} />
      )}

      {/* TAB 4: COMPARE REPORTS */}
      {activeTab === 'compare' && (
        <ReportComparison
          patientId={user?.patient?.id || user?.patient_id || 'PAT-1001'}
          records={recordsData?.records || []}
        />
      )}

      {/* TAB 5: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Pill size={18} color="var(--accent)" />
              <span>Prescription Records & Instructions</span>
            </h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Doctor</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {recordsData?.prescriptions?.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.medication_name}</td>
                    <td>{p.dosage}</td>
                    <td>{p.frequency}</td>
                    <td>{p.duration}</td>
                    <td>{p.doctor_name || 'Dr. Arun Kumar'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {lang === 'ta' ? (p.instructions_ta || p.instructions) : p.instructions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SafeDisclaimer />
    </div>
  );
}
