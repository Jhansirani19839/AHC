import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Pill, Stethoscope, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export default function Timeline({ records = [] }) {
  const { lang, t } = useLanguage();
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  const getRecordIcon = (type) => {
    switch (type) {
      case 'Prescription':
        return <Pill size={16} color="#0284c7" />;
      case 'Diagnostic Report':
        return <Stethoscope size={16} color="#7c3aed" />;
      case 'Discharge Summary':
        return <FileText size={16} color="#d97706" />;
      default:
        return <FileText size={16} color="#059669" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!records || records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <p>{lang === 'ta' ? 'காலவரிசையில் பதிவுகள் எதுவும் இல்லை.' : 'No medical records found in this health timeline.'}</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {records.map((rec) => {
        const isExpanded = expandedRecordId === rec.id;
        const diagnostics = rec.diagnostics || [];
        const prescriptions = rec.prescriptions || [];
        const flaggedDiagnostics = diagnostics.filter(d => d.is_flagged === 1);
        const summaryText = lang === 'ta' ? (rec.ai_summary_ta || rec.ai_summary) : rec.ai_summary;

        return (
          <div key={rec.id} className="timeline-item">
            <div className="timeline-marker" />
            <div className="timeline-content">
              {/* Header */}
              <div className="timeline-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f1f5f9',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)'
                  }}>
                    {getRecordIcon(rec.record_type)}
                    {rec.record_type}
                  </span>
                  <span className="timeline-date">{formatDate(rec.record_date)}</span>
                  {rec.fhir_resource_type && (
                    <span style={{ fontSize: '0.7rem', color: '#64748b', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 5px', borderRadius: '3px' }}>
                      FHIR: {rec.fhir_resource_type}
                    </span>
                  )}
                </div>

                {flaggedDiagnostics.length > 0 ? (
                  <span className="badge badge-flagged" title={t('flaggedReview')}>
                    <AlertTriangle size={12} />
                    {flaggedDiagnostics.length} {lang === 'ta' ? 'மறுஆய்வு' : 'Flagged'}
                  </span>
                ) : (
                  <span className="badge badge-normal">
                    <CheckCircle size={12} />
                    {lang === 'ta' ? 'இயல்பானது' : 'Normal'}
                  </span>
                )}
              </div>

              {/* Title & Short Summary */}
              <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                {rec.title}
              </h4>

              {summaryText && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {summaryText.split('\n\n⚠️')[0]}
                </p>
              )}

              {/* Flagged Values Chips */}
              {flaggedDiagnostics.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {flaggedDiagnostics.map(fd => (
                    <span
                      key={fd.id}
                      style={{
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#be123c',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      ⚠️ {fd.test_name}: {fd.test_value} {fd.unit} ({fd.reference_range})
                    </span>
                  ))}
                </div>
              )}

              {/* Expand/Collapse details button */}
              <button
                onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  marginTop: '4px',
                  padding: '2px 0'
                }}
              >
                {isExpanded ? (
                  <><span>{lang === 'ta' ? 'குறைவான விவரங்கள்' : 'Hide Detailed Breakdown'}</span> <ChevronUp size={14} /></>
                ) : (
                  <><span>{lang === 'ta' ? 'முழு விவரங்களைக் காண்க' : 'View Full Extracted Values'}</span> <ChevronDown size={14} /></>
                )}
              </button>

              {/* Expanded Table Breakdown */}
              {isExpanded && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  {diagnostics.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {lang === 'ta' ? 'ஆய்வகப் பரிசோதனை முடிவுகள்:' : 'Laboratory Observations:'}
                      </h5>
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Test Name</th>
                              <th>Result Value</th>
                              <th>Reference Range</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnostics.map(d => (
                              <tr key={d.id}>
                                <td style={{ fontWeight: 500 }}>{d.test_name}</td>
                                <td><strong>{d.test_value}</strong> {d.unit}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{d.reference_range}</td>
                                <td>
                                  {d.is_flagged ? (
                                    <span className="badge badge-flagged">
                                      {t('flaggedReview')}
                                    </span>
                                  ) : (
                                    <span className="badge badge-normal">
                                      {t('normalRange')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {prescriptions.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {lang === 'ta' ? 'மருந்து விவரங்கள்:' : 'Prescription Items:'}
                      </h5>
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                              <th>Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptions.map(p => (
                              <tr key={p.id}>
                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.medication_name}</td>
                                <td>{p.dosage}</td>
                                <td>{p.frequency}</td>
                                <td>{p.duration}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {lang === 'ta' ? (p.instructions_ta || p.instructions) : p.instructions}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Record Code: <code>{rec.record_code}</code> • Verified by Doctor: {rec.doctor_name || 'Dr. Arun Kumar'}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
