import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SafeDisclaimer({ compact = false }) {
  const { lang, t } = useLanguage();

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#92400e',
        marginTop: '8px'
      }}>
        <AlertCircle size={14} style={{ flexShrink: 0 }} />
        <span>{t('disclaimer')}</span>
      </div>
    );
  }

  return (
    <div className="safety-disclaimer-box">
      <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
      <div>
        <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '2px', color: '#78350f' }}>
          {lang === 'ta' ? 'மருத்துவ AI பாதுகாப்பு மறுப்புரை' : 'Clinical AI Safety & Medical Disclaimer'}
        </strong>
        <span>{t('disclaimer')}</span>
        <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#b45309' }}>
          {lang === 'ta' 
            ? 'அவசர அல்லது முக்கியமான மருத்துவ முடிவுகளுக்கு உங்கள் பாவை மாதிரி மருத்துவமனை மருத்துவரை அணுகவும்.'
            : 'For emergency conditions or clinical prescriptions, please consult your attending physician at Paavai Demo Hospital directly.'}
        </span>
      </div>
    </div>
  );
}
