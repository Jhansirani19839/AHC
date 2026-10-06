import React, { useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Upload, CheckCircle2, Clock, FileText, AlertTriangle, X, ShieldAlert, Sparkles, Edit2 } from 'lucide-react';
import SafeDisclaimer from './SafeDisclaimer';

export default function UploadModal({ patient, onClose, onRecordSaved }) {
  const { lang, t } = useLanguage();
  const [docType, setDocType] = useState('Lab Report');
  const [title, setTitle] = useState('Comprehensive Blood Panel & Glycemic Re-evaluation');
  const [selectedFile, setSelectedFile] = useState(null);
  const [useSampleFile, setUseSampleFile] = useState(true);

  // Pipeline stages: 'IDLE' | 'PROCESSING' | 'DOCTOR_VERIFY' | 'SAVED'
  const [stage, setStage] = useState('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Extracted data for verification
  const [extractedData, setExtractedData] = useState(null);
  const [editableTests, setEditableTests] = useState([]);
  const [editableMeds, setEditableMeds] = useState([]);
  const [ocrRawText, setOcrRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const steps = [
    'Uploading document...',
    'OCR Processing...',
    'Extracting medical fields...',
    'Validating clinical ranges...',
    'Waiting for doctor verification...',
    'Saved to patient timeline.'
  ];

  const handleStartProcessing = async () => {
    setStage('PROCESSING');
    setCurrentStepIndex(0);

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('patient_id', patient.id);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      // Simulate step-by-step visual animation for hackathon demo
      for (let i = 0; i < 4; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 600));
      }

      const res = await api.processOcr(formData);
      setCurrentStepIndex(4); // Waiting for doctor verification

      setExtractedData(res.pipeline.extracted);
      setOcrRawText(res.pipeline.ocr.rawOcrText);
      setEditableTests(res.pipeline.validated.tests || []);
      setEditableMeds(res.pipeline.validated.medications || []);

      setStage('DOCTOR_VERIFY');
    } catch (err) {
      alert('Error during OCR processing: ' + err.message);
      setStage('IDLE');
    }
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...editableTests];
    updated[index][field] = value;
    // Recalculate flag if value changed
    if (field === 'test_value') {
      const num = parseFloat(value);
      if (!isNaN(num) && updated[index].reference_range) {
        const rangeMatch = updated[index].reference_range.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          if (num < min || num > max) {
            updated[index].is_flagged = 1;
            updated[index].flag_reason = 'Flagged for professional review: Outside sample reference range';
          } else {
            updated[index].is_flagged = 0;
            updated[index].flag_reason = null;
          }
        }
      }
    }
    setEditableTests(updated);
  };

  const handleDoctorVerifyAndSave = async () => {
    setSaving(true);
    try {
      const payload = {
        patient_id: patient.id,
        record_type: docType,
        title: title || `${docType} - Verified by Doctor`,
        record_date: extractedData?.report_date || new Date().toISOString().slice(0, 10),
        file_name: selectedFile ? selectedFile.name : `sample_${docType.toLowerCase().replace(' ', '_')}.pdf`,
        file_path: 'uploads/sample_report.pdf',
        ocr_raw_text: ocrRawText,
        extracted_data: {
          ...extractedData,
          tests: editableTests,
          medications: editableMeds
        },
        is_verified: true
      };

      const res = await api.saveRecord(payload);
      setCurrentStepIndex(5);
      setStage('SAVED');
      setSaveSuccessMsg(res.message);

      setTimeout(() => {
        onRecordSaved(res.record);
        onClose();
      }, 1800);
    } catch (err) {
      alert('Failed to save verified record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {lang === 'ta' ? 'மருத்துவ ஆவணப் பதிவேற்றம் & OCR' : 'Upload & OCR Medical Document'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Patient: <strong>{patient.name}</strong> ({patient.patient_code})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* STEP PROGRESS BAR */}
          <div style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Processing Pipeline (Document → OCR → Extraction → Validation → Doctor Verification → Storage)
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Step {currentStepIndex + 1} of 6
              </span>
            </div>

            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentStepIndex + 1) / 6) * 100}%`,
                  backgroundColor: currentStepIndex === 5 ? 'var(--success)' : 'var(--primary)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {stage === 'PROCESSING' && <Clock size={16} className="animate-pulse" color="var(--primary)" />}
              {stage === 'DOCTOR_VERIFY' && <Edit2 size={16} color="var(--warning)" />}
              {stage === 'SAVED' && <CheckCircle2 size={16} color="var(--success)" />}
              <span>{steps[currentStepIndex]}</span>
            </div>
          </div>

          {/* STAGE 1: SELECTION & UPLOAD */}
          {stage === 'IDLE' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Document Category</label>
                  <select
                    className="form-select"
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value);
                      if (e.target.value === 'Lab Report') setTitle('Comprehensive Metabolic Panel & Glycemic Re-evaluation');
                      if (e.target.value === 'Prescription') setTitle('Prescription - Glycemic Management & Supplements');
                      if (e.target.value === 'Diagnostic Report') setTitle('Cardiovascular Screening & 12-Lead ECG');
                      if (e.target.value === 'Discharge Summary') setTitle('Inpatient Clinical Discharge Summary');
                    }}
                  >
                    <option value="Lab Report">Lab Report (Blood / Chemistry)</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Diagnostic Report">Diagnostic Report (ECG / Imaging)</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Record Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter record title"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                style={{
                  border: '2px dashed #93c5fd',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <FileText size={40} color="#2563eb" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {selectedFile ? selectedFile.name : 'Select or Drop Medical Report / Prescription'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports PDF, JPG, PNG (or click "Process Demo Document" for instant hackathon test)
                </p>
                <input
                  id="file-upload-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                color: '#1e40af',
                marginBottom: '16px'
              }}>
                <strong>Hackathon Demo Note:</strong> Preloaded clinical templates (CBC, Blood Glucose, Metformin Rx, ECG) are integrated for zero-friction demonstration without requiring external cloud OCR APIs.
              </div>
            </div>
          )}

          {/* STAGE 2: PROCESSING (SPINNER) */}
          {stage === 'PROCESSING' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '4px solid #dbeafe',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {steps[currentStepIndex]}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                Parsing document structure, normalizing optical characters, mapping medical terminology to clinical reference standards...
              </p>
            </div>
          )}

          {/* STAGE 3: DOCTOR VERIFICATION (REVIEW & EDIT EXTRACTED FIELDS) */}
          {stage === 'DOCTOR_VERIFY' && (
            <div>
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldAlert size={22} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>
                    Mandatory Doctor Verification
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#78350f', margin: 0 }}>
                    Please review extracted values. Any values outside sample reference ranges have been tagged with <em>“Flagged for professional review”</em>. You can modify numbers prior to saving.
                  </p>
                </div>
              </div>

              {/* Extracted Lab Tests Table */}
              {editableTests.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Extracted Diagnostic Tests ({editableTests.length})
                  </h4>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Test Parameter</th>
                          <th>Value</th>
                          <th>Unit</th>
                          <th>Reference Range</th>
                          <th>Clinical Review Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableTests.map((test, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{test.test_name}</td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                style={{ width: '90px', padding: '4px 8px', fontSize: '0.85rem' }}
                                value={test.test_value}
                                onChange={(e) => handleTestChange(idx, 'test_value', e.target.value)}
                              />
                            </td>
                            <td>{test.unit}</td>
                            <td>{test.reference_range}</td>
                            <td>
                              {test.is_flagged ? (
                                <span className="badge badge-flagged">
                                  Flagged for professional review
                                </span>
                              ) : (
                                <span className="badge badge-normal">
                                  Normal Range
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

              {/* Extracted Medications */}
              {editableMeds.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Extracted Prescription Items ({editableMeds.length})
                  </h4>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableMeds.map((med, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{med.medication_name}</td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Raw OCR Text Toggle Preview */}
              <details style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View Raw OCR Extracted Text</summary>
                <pre style={{
                  marginTop: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  maxHeight: '140px',
                  overflowY: 'auto'
                }}>
                  {ocrRawText}
                </pre>
              </details>

              <SafeDisclaimer compact />
            </div>
          )}

          {/* STAGE 4: SAVED SUCCESS */}
          {stage === 'SAVED' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle2 size={54} color="var(--success)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Record Verified & Successfully Saved!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {saveSuccessMsg || 'The medical record has been securely committed and appended to the patient’s unified chronological timeline.'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Sparkles size={14} /> AI Health Summary automatically updated
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {stage === 'IDLE' && (
            <>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleStartProcessing}>
                <Sparkles size={16} />
                <span>Process Document with OCR</span>
              </button>
            </>
          )}

          {stage === 'DOCTOR_VERIFY' && (
            <>
              <button className="btn btn-secondary" onClick={() => setStage('IDLE')}>
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={handleDoctorVerifyAndSave}
                disabled={saving}
              >
                <CheckCircle2 size={16} />
                <span>{saving ? 'Saving...' : 'Verify and Save Record'}</span>
              </button>
            </>
          )}

          {stage === 'SAVED' && (
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
