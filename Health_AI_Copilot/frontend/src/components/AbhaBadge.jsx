import React from 'react';
import { ShieldCheck, FileCheck, Info } from 'lucide-react';

export default function AbhaBadge({ patient, fhirType = null, showInfoBox = false }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {patient?.abha_id && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <ShieldCheck size={13} />
            ABHA: {patient.abha_id}
          </span>
        )}

        {patient?.health_id && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            Health ID: {patient.health_id}
          </span>
        )}

        {fhirType && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #cbd5e1',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 600
          }}>
            <FileCheck size={12} />
            FHIR: {fhirType}
          </span>
        )}
      </div>

      {showInfoBox && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '4px'
        }}>
          <Info size={14} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>
            <strong>ABDM & FHIR Architecture:</strong> Uses standard internal Patient ID with future-ready mapping for Ayushman Bharat Digital Mission (ABDM) and FHIR resource schemas. Not certified in prototype.
          </span>
        </div>
      )}
    </div>
  );
}
