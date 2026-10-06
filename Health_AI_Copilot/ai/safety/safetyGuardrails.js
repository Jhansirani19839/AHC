/**
 * AI Safety Guardrails Module
 * Enforces medical safety rules for health AI outputs.
 * 
 * Rules:
 * - Does NOT diagnose diseases
 * - Does NOT prescribe medicines or adjust dosages
 * - Does NOT advise stopping medications
 * - Does NOT replace a licensed healthcare professional
 * - Must ALWAYS attach standard safe medical AI disclaimer
 */

const MEDICAL_DISCLAIMER_EN = 
  "AI-generated information is for understanding health records and does not replace professional medical advice, diagnosis, or treatment. Always discuss your health records and symptoms with your qualified healthcare provider.";

const MEDICAL_DISCLAIMER_TA = 
  "செயற்கை நுண்ணறிவு (AI) வழங்கும் தகவல்கள் மருத்துவப் பதிவுகளை புரிந்து கொள்வதற்காக மட்டுமே. இது தகுதிவாய்ந்த மருத்துவரின் நேரடி ஆலோசனை, நோய் கண்டறிதல் அல்லது சிகிச்சைக்கு மாற்றாகாது. எந்தவொரு மருத்துவ மாற்றத்திற்கும் உங்கள் மருத்துவரை அணுகவும்.";

class SafetyGuardrails {
  constructor() {
    this.disclaimerEn = MEDICAL_DISCLAIMER_EN;
    this.disclaimerTa = MEDICAL_DISCLAIMER_TA;
  }

  /**
   * Evaluates user prompt for hazardous queries
   * @param {string} prompt 
   * @returns {Object} assessment
   */
  evaluatePromptSafety(prompt) {
    if (!prompt) return { isSafe: true };
    const lower = prompt.toLowerCase();

    // Check for medication adjustment or discontinuation questions
    if (lower.includes('stop taking') || lower.includes('stop medication') || lower.includes('quit my medicine') || lower.includes('change my dose')) {
      return {
        isSafe: false,
        reason: 'MEDICATION_DISCONTINUATION_ATTEMPT',
        safeResponse: {
          en: "You should never stop or alter your prescribed medication without direct consultation with your prescribing doctor. Please contact your doctor at Paavai Demo Hospital to discuss any concerns or side effects.",
          ta: "உங்கள் மருத்துவரின் ஆலோசனை இல்லாமல் மருந்துகளை நிறுத்துவதோ அல்லது அளவை மாற்றுவதோ கூடாது. எவ்வித சந்தேகங்களுக்கும் உங்கள் பாவை மாதிரி மருத்துவமனை மருத்துவரை அணுகவும்."
        }
      };
    }

    // Check for diagnostic demand
    if (lower.includes('do i have cancer') || lower.includes('diagnose me') || lower.includes('what disease do i have')) {
      return {
        isSafe: false,
        reason: 'DIAGNOSTIC_DEMAND',
        safeResponse: {
          en: "The AI Health Copilot cannot provide clinical diagnoses. A definitive diagnosis requires physical examination, clinical history, and clinical correlation by a licensed physician.",
          ta: "AI ஹெல்த் கோபைலட் எந்த ஒரு நோயையும் கண்டறியாது. முழுமையான மருத்துவப் பரிசோதனைக்கு உங்கள் தகுதிவாய்ந்த மருத்துவரை அணுகவும்."
        }
      };
    }

    return { isSafe: true };
  }

  /**
   * Sanitizes output and appends safety disclaimer
   * @param {string} text 
   * @param {string} lang 
   * @returns {string} sanitized text with disclaimer
   */
  appendDisclaimer(text, lang = 'en') {
    const disclaimer = lang === 'ta' ? this.disclaimerTa : this.disclaimerEn;
    if (text.includes(disclaimer)) return text;
    return `${text}\n\n⚠️ ${disclaimer}`;
  }
}

module.exports = new SafetyGuardrails();
