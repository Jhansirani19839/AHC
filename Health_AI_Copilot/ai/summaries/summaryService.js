/**
 * AI Summary Service Module
 * Automatically produces simple-language medical record and patient profile summaries
 * in both English and Tamil with strict clinical safety standards.
 */

const safety = require('../safety/safetyGuardrails');

class SummaryService {
  /**
   * Generates summary for a single medical record
   * @param {Object} record - record data with tests or medications
   * @returns {Object} { en: string, ta: string }
   */
  generateRecordSummary(record) {
    const docType = record.record_type || 'Medical Record';
    const tests = record.tests || (record.extracted_data_json ? JSON.parse(record.extracted_data_json).tests : []) || [];
    const medications = record.medications || (record.extracted_data_json ? JSON.parse(record.extracted_data_json).medications : []) || [];

    let en = '';
    let ta = '';

    if (docType === 'Lab Report' || docType === 'Diagnostic Report') {
      const flagged = tests.filter(t => t.is_flagged || (t.validation_status === 'FLAGGED_REVIEW'));
      const normal = tests.filter(t => !t.is_flagged && (t.validation_status !== 'FLAGGED_REVIEW'));

      if (flagged.length > 0) {
        const flaggedNames = flagged.map(f => f.test_name).join(', ');
        en = `Your ${docType.toLowerCase()} contains ${tests.length} recorded parameters. ${flagged.length} value(s) (${flaggedNames}) are outside the sample reference range and have been flagged for professional review. Other counts (${normal.map(n => n.test_name).join(', ')}) remain within standard sample bounds. Please discuss these findings with your healthcare professional.`;
        ta = `உங்கள் ${docType} ஆய்வில் ${tests.length} பரிசோதனைகள் பதிவு செய்யப்பட்டுள்ளன. இதில் ${flaggedNames} ஆகிய ${flagged.length} அளவுகள் கொடுக்கப்பட்ட reference range-ஐ விட மாறுபட்டு உள்ளதால் மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளன. மற்ற அளவுகள் இயல்பாக உள்ளன. இதைப் பற்றி மருத்துவரிடம் ஆலோசிக்கவும்.`;
      } else {
        en = `Your ${docType.toLowerCase()} shows that all ${tests.length} recorded values fall within the standard sample reference ranges. Everything appears stable based on this document.`;
        ta = `உங்கள் ${docType} ஆய்வில் உள்ள அனைத்து ${tests.length} அளவுகளும் கொடுக்கப்பட்ட sample reference range-க்குள் இயல்பாக உள்ளன. இந்த ஆவணத்தின்படி அளவுகள் சீராக உள்ளன.`;
      }
    } else if (docType === 'Prescription') {
      const medNames = medications.map(m => m.medication_name).join(', ');
      en = `This prescription includes ${medications.length} medication(s): ${medNames}. Please take these exactly as instructed by your doctor at Paavai Demo Hospital.`;
      ta = `இந்த மருந்துச் சீட்டில் ${medNames} ஆகிய மருந்துகள் குறிப்பிடப்பட்டுள்ளன. மருத்துவரின் அறிவுரைப்படி மருந்துகளை முறையாக உட்கொள்ளவும்.`;
    } else {
      en = `Discharge summary and clinical documentation recorded by the attending doctor. Please follow the outlined discharge care plan.`;
      ta = `மருத்துவமனை டிஸ்சார்ஜ் சுருக்கம் மற்றும் மருத்துவ ஆவணங்கள் பதிவு செய்யப்பட்டுள்ளன. மருத்துவரின் வழிகாட்டுதல்களைப் பின்பற்றவும்.`;
    }

    return {
      en: safety.appendDisclaimer(en, 'en'),
      ta: safety.appendDisclaimer(ta, 'ta')
    };
  }

  /**
   * Generates overall health summary for a patient's complete profile
   * @param {Object} patient
   * @param {Array} records
   * @param {Array} diagnostics
   * @param {Array} prescriptions
   * @returns {Object} { en: string, ta: string }
   */
  generatePatientProfileSummary(patient, records = [], diagnostics = [], prescriptions = []) {
    const totalRecords = records.length;
    const flaggedDiagnostics = diagnostics.filter(d => d.is_flagged);

    let en = '';
    let ta = '';

    if (totalRecords === 0) {
      en = `Welcome, ${patient.name}. Your unified health profile is established. No medical records have been uploaded yet. When your records are uploaded, your AI summary and timeline will appear here automatically.`;
      ta = `வணக்கம் ${patient.name}. உங்கள் சுகாதார சுயவிவரம் உருவாக்கப்பட்டது. இதுவரை எந்த மருத்துவ ஆவணங்களும் பதிவேற்றப்படவில்லை. ஆவணங்கள் பதிவேற்றப்படும் போது விவரங்கள் இங்கு தோன்றும்.`;
    } else {
      const flaggedList = [...new Set(flaggedDiagnostics.map(f => `${f.test_name} (${f.test_value} ${f.unit || ''})`))].join(', ');

      if (flaggedDiagnostics.length > 0) {
        en = `Health Profile Summary for ${patient.name}: You have ${totalRecords} medical records in your timeline. Your recent laboratory testing shows parameter(s) outside sample reference ranges: ${flaggedList}. These have been flagged for professional review. Active prescriptions include ${prescriptions.length} prescribed medication(s). Please review your flagged parameters with Dr. Arun Kumar or your attending physician during your next scheduled consultation.`;
        ta = `${patient.name} அவர்களுக்கான சுகாதாரச் சுருக்கம்: உங்கள் காலவரிசையில் ${totalRecords} மருத்துவ ஆவணங்கள் உள்ளன. சமீபத்திய ஆய்வகப் பரிசோதனையில்: ${flaggedList} ஆகியவை reference range-ஐ விட மாறுபட்டு உள்ளதால் மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளன. ${prescriptions.length} மருந்துகள் பரிந்துரைக்கப்பட்டுள்ளன. அடுத்த மருத்துவ சந்திப்பின் போது இதைப் பற்றி உங்கள் மருத்துவரிடம் ஆலோசிக்கவும்.`;
      } else {
        en = `Health Profile Summary for ${patient.name}: You have ${totalRecords} records securely organized. All recent recorded diagnostic parameters are within expected sample reference ranges. Continue following your routine health guidelines.`;
        ta = `${patient.name} அவர்களுக்கான சுகாதாரச் சுருக்கம்: உங்கள் சுயவிவரத்தில் ${totalRecords} மருத்துவ ஆவணங்கள் உள்ளன. சமீபத்திய பரிசோதனை முடிவுகள் அனைத்தும் sample reference range-க்குள் திருப்திகரமாக உள்ளன. மருத்துவரின் பொதுவான உடல்நல வழிகாட்டுதல்களைத் தொடரவும்.`;
      }
    }

    return {
      en: safety.appendDisclaimer(en, 'en'),
      ta: safety.appendDisclaimer(ta, 'ta')
    };
  }
}

module.exports = new SummaryService();
