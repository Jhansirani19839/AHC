import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Users, Search, Upload, Calendar, Clock, ChevronRight, FileText, 
  Stethoscope, AlertTriangle, CheckCircle2, Sparkles, PlusCircle, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import Timeline from '../components/Timeline';
import UploadModal from '../components/UploadModal';
import SafeDisclaimer from '../components/SafeDisclaimer';
import AbhaBadge from '../components/AbhaBadge';
import ReportComparison from '../components/ReportComparison';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [patientRecords, setPatientRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupDate, setFollowupDate] = useState('2026-10-20');
  const [followupNotes, setFollowupNotes] = useState('Review blood glucose control and dietary adjustments');
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Active view in patient profile: 'timeline' | 'summary' | 'compare' | 'prescriptions'
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const fetchAssignedPatients = async () => {
    setLoading(true);
    try {
      const res = await api.getPatients();
      setPatients(res.patients || []);
      // Auto-select first patient if available (e.g. PAT-1001 for demo flow)
      if (res.patients && res.patients.length > 0 && !selectedPatientId) {
        selectPatient(res.patients[0].id);
      }
    } catch (err) {
      console.error('Failed to load assigned patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setLoadingRecords(true);
    try {
      const [patRes, recRes] = await Promise.all([
        api.getPatientById(patientId),
        api.getPatientRecords(patientId)
      ]);
      setPatientDetails(patRes.patient);
      setPatientRecords(recRes);
    } catch (err) {
      alert('Error fetching patient records: ' + err.message);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleRecordSaved = (newRecord) => {
    if (selectedPatientId) {
      selectPatient(selectedPatientId);
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate) return;
    setSubmittingFollowup(true);
    try {
      await api.createFollowUp({
        patient_id: selectedPatientId,
        follow_up_date: followupDate,
        notes: followupNotes
      });
      setShowFollowupModal(false);
      selectPatient(selectedPatientId);
    } catch (err) {
      alert('Failed to set follow-up: ' + err.message);
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-content">
      {/* Doctor Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginBottom: '24px',
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
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px' }}>
                {user.user_code}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {user.doctor?.department || 'Internal Medicine'} • Paavai Demo Hospital
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              Welcome, {user.name}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Authorized Patients in Clinical Scope: <strong>{patients.length}</strong>
            </p>
          </div>
        </div>

        {patientDetails && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowFollowupModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <Calendar size={15} />
              <span>Set Follow-up</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Upload size={15} />
              <span>Upload Medical Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Patient Selector / Right Patient Health Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Left Column: Assigned Patients List */}
        <div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Assigned Patients ({patients.length})
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Strict RBAC</span>
            </div>

            {/* Patient Search */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.825rem' }}
              />
            </div>

            {/* Patients List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflowY: 'auto' }}>
              {filteredPatients.map(p => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPatient(p.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                        {p.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '3px' }}>
                        {p.patient_code}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{p.age} yrs • {p.gender} • {p.blood_group}</span>
                      <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                        {p.record_count} Records
                      </span>
                    </div>

                    {p.flagged_count > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <span className="badge badge-flagged" style={{ fontSize: '0.68rem' }}>
                          ⚠️ {p.flagged_count} Flagged Values
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching patients found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Comprehensive Profile */}
        <div>
          {loadingRecords && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Clock size={32} className="animate-pulse" style={{ margin: '0 auto 12px' }} />
              <p>Loading patient health profile and records...</p>
            </div>
          )}

          {!loadingRecords && patientDetails && (
            <div>
              {/* Patient Demographics & ABHA Card */}
              <div className="card" style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {patientDetails.name}
                      </h2>
                      <span style={{
                        backgroundColor: '#eff6ff',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {patientDetails.patient_code}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Age: <strong>{patientDetails.age}</strong> • Gender: <strong>{patientDetails.gender}</strong> • Blood Group: <strong>{patientDetails.blood_group}</strong> • Phone: {patientDetails.phone}
                    </p>

                    <div style={{ marginTop: '10px' }}>
                      <AbhaBadge patient={patientDetails} showInfoBox={false} />
                    </div>
                  </div>

                  {/* Follow-up Banner */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    textAlign: 'right'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>
                      Next Scheduled Follow-up:
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                      {patientDetails.next_follow_up?.follow_up_date || 'None Scheduled'}
                    </strong>
                    {patientDetails.next_follow_up?.notes && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '240px', marginTop: '2px' }}>
                        {patientDetails.next_follow_up.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient AI Health Summary */}
              {patientRecords?.overall_summary && (
                <div className="card" style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={18} color="#16a34a" />
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#166534', margin: 0 }}>
                      {lang === 'ta' ? 'AI சுகாதார சுருக்கம் (தானியங்கி)' : 'AI-Generated Patient Health Summary'}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: 1.6 }}>
                    {lang === 'ta'
                      ? patientRecords.overall_summary.ta?.split('\n\n⚠️')[0]
                      : patientRecords.overall_summary.en?.split('\n\n⚠️')[0]}
                  </p>
                  <SafeDisclaimer compact />
                </div>
              )}

              {/* Sub-tabs: Timeline / Compare / Prescriptions */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <button
                  onClick={() => setActiveTab('timeline')}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activeTab === 'timeline' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'timeline' ? '2px solid var(--primary)' : 'none'
                  }}
                >
                  Chronological Timeline ({patientRecords?.timeline?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activeTab === 'compare' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'compare' ? '2px solid var(--primary)' : 'none'
                  }}
                >
                  Compare Laboratory Reports
                </button>

                <button
                  onClick={() => setActiveTab('prescriptions')}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activeTab === 'prescriptions' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'prescriptions' ? '2px solid var(--primary)' : 'none'
                  }}
                >
                  Prescriptions ({patientRecords?.prescriptions?.length || 0})
                </button>
              </div>

              {/* TAB 1: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <FileText size={18} color="var(--primary)" />
                      <span>Unified Patient Health Timeline</span>
                    </h3>
                    <button onClick={() => setShowUploadModal(true)} className="btn btn-primary btn-sm">
                      <Upload size={14} />
                      <span>Upload Medical Report</span>
                    </button>
                  </div>
                  <Timeline records={patientRecords?.timeline || []} />
                </div>
              )}

              {/* TAB 2: COMPARE REPORTS */}
              {activeTab === 'compare' && (
                <ReportComparison
                  patientId={selectedPatientId}
                  records={patientRecords?.records || []}
                />
              )}

              {/* TAB 3: PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Active Medication Regimen</h3>
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Prescribing Doctor</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientRecords?.prescriptions?.map(p => (
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
            </div>
          )}
        </div>
      </div>

      {/* OCR UPLOAD MODAL */}
      {showUploadModal && patientDetails && (
        <UploadModal
          patient={patientDetails}
          onClose={() => setShowUploadModal(false)}
          onRecordSaved={handleRecordSaved}
        />
      )}

      {/* FOLLOW-UP MODAL */}
      {showFollowupModal && patientDetails && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Schedule Patient Follow-up
              </h3>
              <button onClick={() => setShowFollowupModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateFollowup}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Follow-up Notes / Reason</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={followupNotes}
                    onChange={(e) => setFollowupNotes(e.target.value)}
                    placeholder="e.g. Recheck blood glucose and lipid panel"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFollowupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingFollowup}>
                  <span>{submittingFollowup ? 'Scheduling...' : 'Save Follow-up'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SafeDisclaimer />
    </div>
  );
}
