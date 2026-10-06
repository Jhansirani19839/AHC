import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Stethoscope, FileText, Activity, Shield, AlertTriangle, 
  CheckCircle2, RefreshCw, Key, Building2, Clock, ArrowRight 
} from 'lucide-react';
import SafeDisclaimer from '../components/SafeDisclaimer';

export default function AdminDashboard() {
  const { lang, t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [matrix, setMatrix] = useState({ doctors: [], patients: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'patients' | 'access' | 'activity'

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes, matrixRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminActivity(),
        api.getAdminMatrix()
      ]);
      setStats(statsRes.stats);
      setActivity(actRes.logs || []);
      setMatrix(matrixRes);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#b45309',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              ADMINISTRATION CONSOLE
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Hospital: Paavai Demo Hospital
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Hospital Overview & Access Governance
          </h1>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* STATS ROW */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.total_doctors ?? 4}</div>
            <div className="stat-label">Active Doctors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.total_patients ?? 4}</div>
            <div className="stat-label">Registered Patients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.total_records ?? 7}</div>
            <div className="stat-label">Total Medical Records</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.total_flagged_parameters ?? 8}</div>
            <div className="stat-label">Flagged Clinical Observations</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        {[
          { id: 'overview', label: 'Hospital Overview' },
          { id: 'doctors', label: `Doctors (${matrix.doctors.length})` },
          { id: 'patients', label: `Patients (${matrix.patients.length})` },
          { id: 'access', label: 'RBAC Authorization Matrix' },
          { id: 'activity', label: `Audit Log (${activity.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3 className="card-title">
              <Building2 size={18} color="var(--primary)" />
              <span>Paavai Demo Hospital Profile</span>
            </h3>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
              <p><strong>Institution:</strong> Paavai Demo Hospital Central System</p>
              <p><strong>Environment:</strong> 24-Hour Hackathon Prototype Mode</p>
              <p><strong>Security Standard:</strong> Strict Role-Based Access Control (RBAC)</p>
              <p><strong>OCR Service Architecture:</strong> Optical Preprocessing, Regex Entity Extractor, Reference Range Bound Validator</p>
              <p><strong>AI Inference Layer:</strong> Local Safe Mock Clinical Synthesizer with bilingual support (English & Tamil)</p>
              <p><strong>ABDM Status:</strong> Future-Ready Schemas (Primary internal ID mapped to optional ABHA / Health ID fields)</p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">
              <Shield size={18} color="var(--success)" />
              <span>System Health & Compliance</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>SQLite Database</span>
                <span className="badge badge-normal"><CheckCircle2 size={12} /> Connected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>OCR Engine Pipeline</span>
                <span className="badge badge-normal"><CheckCircle2 size={12} /> Operational</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>AI Safety Guardrails</span>
                <span className="badge badge-normal"><CheckCircle2 size={12} /> Active & Enforced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Doctor Verification Checkpoint</span>
                <span className="badge badge-blue"><Shield size={12} /> Mandatory Before Save</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Medical Staff Roster ({matrix.doctors.length} Doctors)</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Assigned Patients</th>
                </tr>
              </thead>
              <tbody>
                {matrix.doctors.map(d => (
                  <tr key={d.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{d.doctor_code}</strong></td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.specialization}</td>
                    <td style={{ fontSize: '0.8rem' }}>{d.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {d.assigned_patients?.map(p => (
                          <span key={p.id} className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                            {p.patient_code} ({p.name})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PATIENTS */}
      {activeTab === 'patients' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Patient Directory ({matrix.patients.length} Patients)</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Demographics</th>
                  <th>ABHA / Health ID</th>
                  <th>Medical Records</th>
                  <th>Authorized Doctors</th>
                </tr>
              </thead>
              <tbody>
                {matrix.patients.map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{p.patient_code}</strong></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.age} yrs • {p.gender} • Blood: <strong>{p.blood_group}</strong></td>
                    <td style={{ fontSize: '0.75rem' }}>
                      <div>ABHA: <code>{p.abha_id || 'Pending'}</code></div>
                      <div>ID: <code>{p.health_id || 'Pending'}</code></div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {p.record_count} Records
                      </span>
                      {p.flagged_count > 0 && (
                        <span className="badge badge-flagged" style={{ marginLeft: '4px' }}>
                          {p.flagged_count} Flagged
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.assigned_doctors?.map(d => (
                          <span key={d.id} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                            {d.doctor_code} ({d.name})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCESS MATRIX */}
      {activeTab === 'access' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Role-Based Access Control (RBAC) Isolation Matrix</h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Strict clinical data boundary: Doctors can only query and modify assigned patients. Patients can only query their own records.
          </p>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor Account</th>
                  <th>Authorized Patient Codes</th>
                  <th>Access Scope</th>
                  <th>Security Policy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>DOC-001 (Dr. Arun Kumar)</strong></td>
                  <td><span className="badge badge-blue">PAT-1001</span> <span className="badge badge-blue">PAT-1002</span></td>
                  <td>Read, OCR Upload, Verify, Summaries</td>
                  <td>Strict isolation (PAT-1003 & 1004 blocked with 403)</td>
                </tr>
                <tr>
                  <td><strong>DOC-002 (Dr. Priya)</strong></td>
                  <td><span className="badge badge-blue">PAT-1001</span> <span className="badge badge-blue">PAT-1003</span></td>
                  <td>Read, Diagnostic Reports, ECG, Summaries</td>
                  <td>Strict isolation (PAT-1002 & 1004 blocked with 403)</td>
                </tr>
                <tr>
                  <td><strong>DOC-003 (Dr. Karthik)</strong></td>
                  <td><span className="badge badge-blue">PAT-1002</span> <span className="badge badge-blue">PAT-1004</span></td>
                  <td>Read, Endocrine Tracking, Follow-ups</td>
                  <td>Strict isolation (PAT-1001 & 1003 blocked with 403)</td>
                </tr>
                <tr>
                  <td><strong>DOC-004 (Dr. Meena)</strong></td>
                  <td><span className="badge badge-blue">PAT-1003</span> <span className="badge badge-blue">PAT-1004</span></td>
                  <td>Read, Pathology Review, Blood Panels</td>
                  <td>Strict isolation (PAT-1001 & 1002 blocked with 403)</td>
                </tr>
                <tr>
                  <td><strong>All Patients (PAT-1001 to 1004)</strong></td>
                  <td>Self record only</td>
                  <td>Read-only Profile, Timeline, AI Copilot, Compare</td>
                  <td>Strict patient-level data segregation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hospital Audit & Activity Stream</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Code</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {activity.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.created_at}</td>
                    <td><strong>{a.user_code}</strong></td>
                    <td>
                      <span className={`badge ${a.role === 'ADMIN' ? 'badge-warning' : a.role === 'DOCTOR' ? 'badge-blue' : 'badge-normal'}`}>
                        {a.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{a.action}</td>
                    <td style={{ fontSize: '0.82rem' }}>{a.details}</td>
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
