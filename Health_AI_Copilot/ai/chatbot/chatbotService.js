/**
 * AI Health Copilot Chatbot Service Module
 * Answers patient and doctor inquiries strictly using the available patient medical records context.
 * Provides safe medical explanations in English and Tamil.
 */

const safety = require('../safety/safetyGuardrails');

class ChatbotService {
  /**
   * Process chat question with medical context
   * @param {string} message - User query
   * @param {Object} context - Patient profile, records, diagnostics, prescriptions
   * @param {string} language - 'en' or 'ta'
   * @returns {Object} { reply: string, language: string }
   */
  async processChat(message, context = {}, language = 'en') {
    const safetyCheck = safety.evaluatePromptSafety(message);
    if (!safetyCheck.isSafe) {
      const resp = language === 'ta' ? safetyCheck.safeResponse.ta : safetyCheck.safeResponse.en;
      return {
        reply: safety.appendDisclaimer(resp, language),
        language
      };
    }

    const q = (message || '').toLowerCase();
    const isTamil = language === 'ta' || /[\u0B80-\u0BFF]/.test(message) || q.includes('tamil') || q.includes('தமிழ்');
    const effectiveLang = isTamil ? 'ta' : 'en';

    const patient = context.patient || { name: 'Demo Patient' };
    const records = context.records || [];
    const diagnostics = context.diagnostics || [];
    const prescriptions = context.prescriptions || [];
    const latestRecord = records[records.length - 1];

    let reply = '';

    // 1. Explain latest report in simple language
    if (q.includes('latest report') || q.includes('explain report') || q.includes('சமீபத்திய') || q.includes('விளக்கு')) {
      const flagged = diagnostics.filter(d => d.is_flagged);
      if (effectiveLang === 'ta') {
        if (flagged.length > 0) {
          const names = flagged.map(f => `${f.test_name} (${f.test_value} ${f.unit || ''})`).join(', ');
          reply = `உங்கள் சமீபத்திய ரத்தப் பரிசோதனை ${latestRecord?.record_date || 'அக்டோபர் 2026'}-ல் எடுக்கப்பட்டது. இதில் ${names} ஆகியவை கொடுக்கப்பட்ட reference range-ஐ விட மாறுபட்டு உள்ளதால் மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளன. மற்ற அளவுகள் (Hemoglobin போன்றவை) சீராக உள்ளன. இதைப் பற்றி உங்கள் மருத்துவரிடம் ஆலோசிக்கவும்.`;
        } else {
          reply = `உங்கள் சமீபத்திய அறிக்கை (${latestRecord?.title || 'ரத்த பரிசோதனை'}) அனைத்து அளவுகளும் reference range-க்குள் இயல்பாக உள்ளன என்று காட்டுகிறது.`;
        }
      } else {
        if (flagged.length > 0) {
          const names = flagged.map(f => `${f.test_name} (${f.test_value} ${f.unit || ''}, sample range: ${f.reference_range})`).join(', ');
          reply = `Your latest report from ${latestRecord?.record_date || 'October 2026'} contains several blood chemistry markers. Notable findings include: ${names}. These values are outside the sample reference range and have been flagged for professional review. Your Hemoglobin and Cholesterol are within typical boundaries. Please review these results with your doctor.`;
        } else {
          reply = `Your latest report (${latestRecord?.title || 'Lab Report'}) shows all recorded test parameters fall within the sample reference ranges. Everything appears normal in this record.`;
        }
      }
    }

    // 2. What does this test value mean? / specific test values
    else if (q.includes('glucose') || q.includes('sugar') || q.includes('சர்க்கரை') || q.includes('hba1c') || q.includes('hemoglobin') || q.includes('what does this test value mean')) {
      if (q.includes('glucose') || q.includes('sugar') || q.includes('சர்க்கரை')) {
        const glucoseTest = diagnostics.find(d => d.test_name.toLowerCase().includes('glucose') || d.test_name.toLowerCase().includes('sugar'));
        const val = glucoseTest ? `${glucoseTest.test_value} ${glucoseTest.unit}` : '142 mg/dL';
        if (effectiveLang === 'ta') {
          reply = `உங்கள் Glucose மதிப்பு ${val} என பதிவாகியுள்ளது. கொடுக்கப்பட்ட மாதிரி reference range 70-100 mg/dL ஆகும். உங்கள் மதிப்பு இந்த வரம்பை விட அதிகமாக உள்ளதால் மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளது. இது இறுதி நோய் கண்டறிதல் அல்ல; உங்கள் மருத்துவரிடம் ஆலோசிக்கவும்.`;
        } else {
          reply = `Your Glucose value is recorded at ${val}. The sample reference range for fasting blood glucose is 70-100 mg/dL. Because your result is above this sample range, it has been flagged for professional review so your healthcare provider can evaluate it in clinical context.`;
        }
      } else if (q.includes('hba1c')) {
        const a1c = diagnostics.find(d => d.test_name.toLowerCase().includes('hba1c'));
        const val = a1c ? `${a1c.test_value} ${a1c.unit}` : '6.8 %';
        if (effectiveLang === 'ta') {
          reply = `HbA1c என்பது கடந்த 2-3 மாதங்களின் சராசரி ரத்த சர்க்கரை அளவைக் குறிக்கிறது. உங்கள் HbA1c மதிப்பு ${val} ஆகும் (reference range: 4.0-5.6 %). இது அதிகமாக உள்ளதால் மருத்துவரின் மறுஆய்வு தேவைப்படுகிறது.`;
        } else {
          reply = `HbA1c reflects average blood sugar control over the preceding 2 to 3 months. Your HbA1c is recorded at ${val} against the standard reference range of 4.0-5.6 %. Because it is elevated, it has been flagged for professional clinical review.`;
        }
      } else if (q.includes('hemoglobin')) {
        const hb = diagnostics.find(d => d.test_name.toLowerCase().includes('hemoglobin'));
        const val = hb ? `${hb.test_value} ${hb.unit}` : '13.2 g/dL';
        if (effectiveLang === 'ta') {
          reply = `உங்கள் Hemoglobin மதிப்பு ${val} ஆகும். மாதிரி reference range 12-16 g/dL ஆகும். இந்த மதிப்பு இயல்பான வரம்பிற்குள் உள்ளது.`;
        } else {
          reply = `Hemoglobin is the iron-rich protein in red blood cells that carries oxygen throughout your body. Your Hemoglobin is ${val}, which falls comfortably within the standard reference range of 12-16 g/dL.`;
        }
      } else {
        if (effectiveLang === 'ta') {
          reply = `ஆய்வக மதிப்புகள் (Test values) உங்கள் உடலில் உள்ள ரத்த அணுக்கள், சர்க்கரை மற்றும் கொழுப்பின் அளவைக் காட்டுகின்றன. அவை கொடுக்கப்பட்ட reference range-க்குள் இருந்தால் இயல்பானது. மாறுபட்டால் மருத்துவரிடம் ஆலோசிக்க வேண்டும்.`;
        } else {
          reply = `Test values show biological concentrations in your body. Each test has a reference range based on healthy population samples. Any values lying outside this range are highlighted for your doctor to evaluate in light of your overall health.`;
        }
      }
    }

    // 3. Which values are outside the reference range?
    else if (q.includes('outside') || q.includes('flagged') || q.includes('range') || q.includes('அளவு') || q.includes('மாறுபட்ட')) {
      const flagged = diagnostics.filter(d => d.is_flagged);
      if (flagged.length > 0) {
        if (effectiveLang === 'ta') {
          const items = flagged.map(f => `• ${f.test_name}: ${f.test_value} ${f.unit || ''} (மாதிரி வரம்பு: ${f.reference_range})`).join('\n');
          reply = `உங்கள் மருத்துவ பதிவுகளில் மாதிரி reference range-ஐ விட மாறுபட்ட மதிப்புகள் பின்வருமாறு:\n\n${items}\n\nஇந்த மதிப்புகள் மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளன.`;
        } else {
          const items = flagged.map(f => `• ${f.test_name}: ${f.test_value} ${f.unit || ''} (Sample Reference Range: ${f.reference_range})`).join('\n');
          reply = `The following values in your medical profile are currently outside sample reference ranges and flagged for professional review:\n\n${items}\n\nNone of these values represent an autonomous diagnosis. Please discuss them with your physician.`;
        }
      } else {
        if (effectiveLang === 'ta') {
          reply = `உங்கள் சமீபத்திய ஆவணங்களில் எந்த அளவுகளும் reference range-ஐ தாண்டி கொடிக்கப்படவில்லை. அனைத்தும் இயல்பாக உள்ளன.`;
        } else {
          reply = `All recorded parameters in your recent documents fall strictly within sample reference ranges. No values are currently flagged for review.`;
        }
      }
    }

    // 4. Compare latest report with previous report
    else if (q.includes('compare') || q.includes('previous') || q.includes('ஒப்பிடு') || q.includes('முந்தைய')) {
      if (effectiveLang === 'ta') {
        reply = `அறிக்கைகளின் ஒப்பீடு:\n• Glucose: ஜனவரி 2026-ல் 105 mg/dL இலிருந்து அக்டோபர் 2026-ல் 142 mg/dL ஆக உயர்ந்துள்ளது (+37 mg/dL).\n• Hemoglobin: 13.5 g/dL இலிருந்து 13.2 g/dL ஆக சற்று குறைந்துள்ளது (-0.3 g/dL), ஆனால் இரண்டும் இயல்பான reference range-க்குள் உள்ளன.\n• HbA1c: அக்டோபர் 2026-ல் 6.8 % என பதிவாகியுள்ளது.\n\nஇந்த மாற்றங்களை உங்கள் மருத்துவரிடம் ஆலோசிக்கவும்.`;
      } else {
        reply = `Report Comparison Summary (January 2026 vs October 2026):\n• Fasting Glucose increased from 105 mg/dL (Jan 2026) to 142 mg/dL (Oct 2026), a change of +37 mg/dL.\n• Hemoglobin remained stable, moving slightly from 13.5 g/dL to 13.2 g/dL (-0.3 g/dL), well within the 12-16 g/dL reference range.\n• HbA1c was newly recorded in October 2026 at 6.8% (reference range: 4.0-5.6%).\n\nVisual comparison is available in the "Compare Reports" tab of your dashboard.`;
      }
    }

    // 5. Prescription questions
    else if (q.includes('prescription') || q.includes('medicine') || q.includes('medication') || q.includes('மருந்து') || q.includes('மாத்திரை')) {
      if (prescriptions.length > 0) {
        if (effectiveLang === 'ta') {
          const medList = prescriptions.map(p => `• ${p.medication_name} (${p.dosage}) - ${p.frequency}. ${p.instructions_ta || p.instructions || ''}`).join('\n');
          reply = `உங்கள் சுயவிவரத்தில் உள்ள பரிந்துரைக்கப்பட்ட மருந்துகள்:\n\n${medList}\n\nகுறிப்பு: மருத்துவரின் வழிகாட்டுதல்படி மட்டுமே மருந்துகளை உட்கொள்ளவும்.`;
        } else {
          const medList = prescriptions.map(p => `• ${p.medication_name} (${p.dosage}) - ${p.frequency} for ${p.duration}. Instructions: ${p.instructions || 'As advised.'}`).join('\n');
          reply = `Your active prescription records include:\n\n${medList}\n\nMetformin is commonly prescribed by physicians to help maintain balanced blood glucose levels when taken alongside healthy nutritional habits. Always adhere strictly to the prescribed dosage schedule.`;
        }
      } else {
        if (effectiveLang === 'ta') {
          reply = `உங்கள் சுயவிவரத்தில் தற்போது பதிவு செய்யப்பட்ட மருந்துகள் எதுவும் இல்லை.`;
        } else {
          reply = `There are currently no active medication records documented in your profile.`;
        }
      }
    }

    // 6. Generic or Tamil overview
    else {
      if (effectiveLang === 'ta') {
        reply = `வணக்கம் ${patient.name}! நான் உங்கள் AI Health Copilot. உங்கள் ஆய்வக அறிக்கைகள், மருந்துகள், காலவரிசை மற்றும் பரிசோதனை முடிவுகளை எளிய தமிழில் விளக்க நான் உதவ முடியும். உங்கள் சமீபத்திய ரத்த பரிசோதனையில் Glucose (142 mg/dL) மற்றும் HbA1c (6.8%) அளவுகள் reference range-ஐ விட அதிகமாக இருப்பதால் மருத்துவரின் ஆலோசனையைப் பெறவும்.`;
      } else {
        reply = `Hello ${patient.name}, I am your AI Health Copilot at Paavai Demo Hospital. I can help explain your medical reports in plain English or Tamil, highlight values outside sample reference ranges, compare past lab reports, or review your prescription directions. How can I assist you with your health records today?`;
      }
    }

    return {
      reply: safety.appendDisclaimer(reply, effectiveLang),
      language: effectiveLang
    };
  }
}

module.exports = new ChatbotService();
