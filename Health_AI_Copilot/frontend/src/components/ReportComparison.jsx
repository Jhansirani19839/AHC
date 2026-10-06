import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight, ArrowDownRight, Minus, RefreshCw, BarChart2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import SafeDisclaimer from './SafeDisclaimer';

export default function ReportComparison({ patientId, records = [] }) {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);

  // Filter lab/diagnostic records
  const labRecords = records.filter(r => r.record_type === 'Lab Report' || r.record_type === 'Diagnostic Report');
  const [prevId, setPrevId] = useState('');
  const [latestId, setLatestId] = useState('');

  useEffect(() => {
    if (labRecords.length >= 2) {
      setPrevId(labRecords[0].id);
      setLatestId(labRecords[labRecords.length - 1].id);
    }
  }, [records]);

  useEffect(() => {
    fetchComparison();
  }, [prevId, latestId, patientId]);

  const fetchComparison = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      const payload = { patient_id: patientId };
      if (prevId && latestId) {
        payload.previous_record_id = prevId;
        payload.latest_record_id = latestId;
      }
      const data = await api.compareReports(payload);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Comparison requires at least 2 diagnostic laboratory reports.');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (changeType) => {
    switch (changeType) {
      case 'INCREASE':
        return <ArrowUpRight size={16} color="#d97706" />;
      case 'DECREASE':
        return <ArrowDownRight size={16} color="#059669" />;
      case 'UNCHANGED':
        return <Minus size={16} color="#64748b" />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <BarChart2 size={20} color="var(--primary)" />
          <span>{t('compare')}</span>
        </h3>
        <button
          onClick={fetchComparison}
          className="btn btn-secondary btn-sm"
          title="Refresh comparison"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Selectors for Previous vs Latest */}
      {labRecords.length >= 2 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          backgroundColor: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Previous Report Baseline</label>
            <select
              className="form-select"
              value={prevId}
              onChange={(e) => setPrevId(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {labRecords.map(r => (
                <option key={r.id} value={r.id}>
                  {r.record_date} - {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Latest Follow-up Report</label>
            <select
              className="form-select"
              value={latestId}
              onChange={(e) => setLatestId(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {labRecords.map(r => (
                <option key={r.id} value={r.id}>
                  {r.record_date} - {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-pulse" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.85rem' }}>Comparing historical values and calculating delta variations...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '16px',
          borderRadius: '8px',
          color: '#1e40af',
          fontSize: '0.85rem'
        }}>
          <strong>Note:</strong> {error}
        </div>
      )}

      {comparisonData && !loading && (
        <div>
          {/* Comparison Narrative Banner */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.86rem',
            lineHeight: 1.5,
            color: '#166534'
          }}>
            <strong>{lang === 'ta' ? 'ஒப்பீட்டு பகுப்பாய்வு சுருக்கம்:' : 'Comparative Analysis Summary:'}</strong>
            <p style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>
              {lang === 'ta'
                ? comparisonData.summary?.ta?.split('\n\n⚠️')[0]
                : comparisonData.summary?.en?.split('\n\n⚠️')[0]}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Test Parameter</th>
                  <th>Previous Value ({comparisonData.previous_report?.date})</th>
                  <th>Latest Value ({comparisonData.latest_report?.date})</th>
                  <th>Reference Range</th>
                  <th>Delta / Change</th>
                  <th>Flag Status</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.rows?.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.test_name}</td>
                    <td>{row.previous_display}</td>
                    <td style={{ fontWeight: 700, color: row.is_flagged_latest ? '#b91c1c' : 'inherit' }}>
                      {row.latest_display}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.reference_range}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.82rem' }}>
                        {renderTrendIcon(row.changeType)}
                        <span style={{
                          color: row.changeType === 'INCREASE' ? '#b45309' : 
                                 row.changeType === 'DECREASE' ? '#047857' : 
                                 'var(--text-muted)'
                        }}>
                          {row.change}
                        </span>
                      </div>
                    </td>
                    <td>
                      {row.is_flagged_latest ? (
                        <span className="badge badge-flagged">
                          <AlertTriangle size={11} /> {t('flaggedReview')}
                        </span>
                      ) : (
                        <span className="badge badge-normal">
                          <CheckCircle2 size={11} /> {t('normalRange')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SafeDisclaimer compact />
        </div>
      )}
    </div>
  );
}
