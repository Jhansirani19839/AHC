/**
 * Validation Service Module
 * Validates extracted OCR data against standard physiological boundaries.
 * Accurately flags out-of-range values with safe non-diagnostic wording:
 * "Flagged for professional review"
 */

class ValidationService {
  constructor() {
    // Reference ranges reference table
    this.standards = {
      'Hemoglobin': { min: 12.0, max: 16.0, unit: 'g/dL' },
      'Glucose': { min: 70.0, max: 100.0, unit: 'mg/dL' },
      'Fasting Blood Sugar': { min: 70.0, max: 100.0, unit: 'mg/dL' },
      'HbA1c': { min: 4.0, max: 5.6, unit: '%' },
      'Total Cholesterol': { min: 125.0, max: 200.0, unit: 'mg/dL' },
      'Heart Rate': { min: 60.0, max: 100.0, unit: 'bpm' },
      'Systolic BP': { min: 90.0, max: 120.0, unit: 'mmHg' },
      'Diastolic BP': { min: 60.0, max: 80.0, unit: 'mmHg' },
      'TSH': { min: 0.4, max: 4.0, unit: 'uIU/mL' },
      'Total WBC': { min: 4000.0, max: 11000.0, unit: '/mcL' },
      'Platelets': { min: 150000.0, max: 450000.0, unit: '/mcL' },
      'Vitamin D3': { min: 30.0, max: 100.0, unit: 'ng/mL' },
      'Vitamin B12': { min: 200.0, max: 900.0, unit: 'pg/mL' }
    };
  }

  /**
   * Validates structured fields and tags each test with flag status
   * @param {Object} extractedData
   * @returns {Object} validated data with flags and validation status
   */
  validateExtractedData(extractedData) {
    const validated = { ...extractedData };
    let flaggedCount = 0;
    const validationErrors = [];

    // Basic demographic checks
    if (!validated.patient_name) {
      validationErrors.push('Patient name missing in document.');
    }
    if (!validated.report_date) {
      validationErrors.push('Report date missing in document.');
    }

    // Validate Tests
    if (Array.isArray(validated.tests)) {
      validated.tests = validated.tests.map(test => {
        const standard = this.standards[test.test_name];
        let isFlagged = 0;
        let flagReason = null;
        const numVal = parseFloat(test.test_value);

        if (standard && !isNaN(numVal)) {
          if (numVal < standard.min) {
            isFlagged = 1;
            flagReason = 'Flagged for professional review: Value below reference range';
          } else if (numVal > standard.max) {
            isFlagged = 1;
            flagReason = 'Flagged for professional review: Value above reference range';
          }
        } else if (test.reference_range && !isNaN(numVal)) {
          // Parse range like "70 - 100 mg/dL"
          const rangeMatch = test.reference_range.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
          if (rangeMatch) {
            const min = parseFloat(rangeMatch[1]);
            const max = parseFloat(rangeMatch[2]);
            if (numVal < min || numVal > max) {
              isFlagged = 1;
              flagReason = 'Flagged for professional review: Value outside standard range';
            }
          }
        }

        if (isFlagged) flaggedCount++;

        return {
          ...test,
          is_flagged: isFlagged,
          flag_reason: flagReason,
          validation_status: isFlagged ? 'FLAGGED_REVIEW' : 'NORMAL'
        };
      });
    }

    // Validate Medications
    if (Array.isArray(validated.medications)) {
      validated.medications = validated.medications.map(med => {
        return {
          ...med,
          validation_status: med.dosage && med.frequency ? 'VALID' : 'REQUIRES_CLARIFICATION'
        };
      });
    }

    validated.validation_summary = {
      is_valid: validationErrors.length === 0,
      validation_errors: validationErrors,
      total_tests: validated.tests ? validated.tests.length : 0,
      flagged_tests_count: flaggedCount,
      requires_doctor_review: true, // Always true for clinical safety
      status_message: flaggedCount > 0 
        ? `${flaggedCount} value(s) outside sample reference range - Flagged for professional review`
        : 'All detected parameters are within sample reference ranges'
    };

    return validated;
  }
}

module.exports = new ValidationService();
