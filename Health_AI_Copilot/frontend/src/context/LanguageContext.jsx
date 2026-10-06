import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    hospitalName: 'Paavai Demo Hospital',
    platformTitle: 'AI Health Copilot',
    switchLang: 'தமிழ்',
    logout: 'Sign Out',
    doctorRole: 'Doctor',
    patientRole: 'Patient',
    adminRole: 'Hospital Admin',
    timeline: 'Health Timeline',
    summary: 'AI Health Summary',
    chat: 'Ask AI Health Copilot',
    compare: 'Compare Reports',
    followup: 'Next Follow-up',
    upload: 'Upload Medical Report',
    flaggedReview: 'Flagged for professional review',
    normalRange: 'Within reference range',
    disclaimer: 'AI-generated information is for understanding health records and does not replace professional medical advice, diagnosis, or treatment.'
  },
  ta: {
    hospitalName: 'பாவை மாதிரி மருத்துவமனை',
    platformTitle: 'AI ஹெல்த் கோபைலட்',
    switchLang: 'English',
    logout: 'வெளியேறு',
    doctorRole: 'மருத்துவர்',
    patientRole: 'நோயாளி',
    adminRole: 'மருத்துவமனை நிர்வாகி',
    timeline: 'சுகாதார காலவரிசை',
    summary: 'AI சுகாதாரச் சுருக்கம்',
    chat: 'AI கோபைலட்டிடம் கேளுங்கள்',
    compare: 'அறிக்கைகளை ஒப்பிடு',
    followup: 'அடுத்த மருத்துவ சந்திப்பு',
    upload: 'மருத்துவ ஆவணத்தைப் பதிவேற்று',
    flaggedReview: 'மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளது',
    normalRange: 'இயல்பான வரம்பிற்குள் உள்ளது',
    disclaimer: 'செயற்கை நுண்ணறிவு (AI) வழங்கும் தகவல்கள் மருத்துவப் பதிவுகளை புரிந்து கொள்வதற்காக மட்டுமே. இது தகுதிவாய்ந்த மருத்துவரின் நேரடி ஆலோசனை அல்லது சிகிச்சைக்கு மாற்றாகாது.'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
