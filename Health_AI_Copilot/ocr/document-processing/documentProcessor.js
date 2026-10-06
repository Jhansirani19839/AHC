/**
 * Document Processor Module
 * Handles file ingestion, text extraction pipeline orchestration, and document categorization.
 */

const fs = require('fs');
const path = require('path');

class DocumentProcessor {
  /**
   * Process an uploaded file buffer or path
   * @param {Object} file - Multer file object or manual file info
   * @param {string} forcedType - Optional override type
   * @returns {Object} processed raw text and metadata
   */
  async processDocument(file, forcedType = null) {
    const filename = file ? (file.originalname || file.name || 'document.pdf') : 'sample_report.pdf';
    const extension = path.extname(filename).toLowerCase();

    // Determine document type by filename clues or forced type
    let detectedType = forcedType || 'Lab Report';
    const lowerName = filename.toLowerCase();

    if (lowerName.includes('rx') || lowerName.includes('prescription')) {
      detectedType = 'Prescription';
    } else if (lowerName.includes('discharge') || lowerName.includes('summary')) {
      detectedType = 'Discharge Summary';
    } else if (lowerName.includes('ecg') || lowerName.includes('diagnostic') || lowerName.includes('xray')) {
      detectedType = 'Diagnostic Report';
    } else if (lowerName.includes('blood') || lowerName.includes('lab') || lowerName.includes('cbc') || lowerName.includes('glucose')) {
      detectedType = 'Lab Report';
    }

    // Build raw simulated OCR text based on document type for the hackathon prototype
    const rawOcrText = this.generateOcrText(filename, detectedType);

    return {
      status: 'OCR_SUCCESS',
      filename,
      extension,
      documentType: detectedType,
      rawOcrText,
      pageCount: 1,
      ocrConfidence: 0.98,
      processedAt: new Date().toISOString()
    };
  }

  generateOcrText(filename, docType) {
    const lower = filename.toLowerCase();

    if (docType === 'Prescription') {
      return `PAAVAI DEMO HOSPITAL
OUTPATIENT PHARMACY PRESCRIPTION
Date: ${new Date().toISOString().slice(0, 10)}
Prescribed By: Dr. Arun Kumar, MD (Internal Medicine)
Patient: Demo Patient 1 | ID: PAT-1001 | Age: 42 | Gender: M

Rx:
1. Tab Metformin 500mg - 1 tablet twice daily after meals (60 days)
2. Tab Multivitamin Complex - 1 tablet once daily morning (30 days)

Instructions:
Take Metformin with food. Maintain light exercise and adequate water intake.
Signed: Dr. Arun Kumar (DOC-001)`;
    }

    if (docType === 'Diagnostic Report') {
      return `PAAVAI DEMO HOSPITAL
CARDIOPULMONARY DIAGNOSTIC REPORT
Date: ${new Date().toISOString().slice(0, 10)}
Attending Physician: Dr. Priya, MD, DM (Cardiology)
Patient Name: Demo Patient 1 | ID: PAT-1001

PROCEDURE: 12-LEAD RESTING ELECTROCARDIOGRAM (ECG)
Heart Rate: 74 bpm [Reference: 60-100 bpm]
PR Interval: 152 ms [Reference: 120-200 ms]
QRS Duration: 88 ms [Reference: 80-120 ms]
Blood Pressure: 124/82 mmHg [Reference: 90/60 - 120/80 mmHg]

IMPRESSION:
Normal Sinus Rhythm. Stable ST-T segments. Hemodynamically stable.`;
    }

    if (docType === 'Discharge Summary') {
      return `PAAVAI DEMO HOSPITAL
INPATIENT DISCHARGE SUMMARY
Date of Admission: 2026-09-10 | Date of Discharge: 2026-09-12
Patient: Demo Patient 1 | ID: PAT-1001 | Age: 42
Primary Consultant: Dr. Arun Kumar

HOSPITAL COURSE:
Patient admitted for routine metabolic monitoring and medication optimization.
Vitals stable throughout hospital stay.
Discharge Advice: Continue oral medications as prescribed. Review after 2 weeks.`;
    }

    // Default: Lab Report / Blood Report
    return `PAAVAI DEMO HOSPITAL
CENTRAL CLINICAL LABORATORY
Accreditation ID: PDH-LAB-2026-NABL
Report Date: ${new Date().toISOString().slice(0, 10)}
Consulting Doctor: Dr. Arun Kumar (DOC-001)

PATIENT DEMOGRAPHICS:
Patient Name: Demo Patient 1
Patient ID: PAT-1001
Age: 42 Yrs | Gender: Male
Sample Collected: Whole Blood (Venous)

TEST INVESTIGATION RESULTS:
Hemoglobin: 13.2 g/dL [Reference Range: 12 - 16 g/dL]
Glucose: 142 mg/dL [Reference Range: 70 - 100 mg/dL] *HIGH*
HbA1c: 6.8 % [Reference Range: 4.0 - 5.6 %] *HIGH*
Total Cholesterol: 190 mg/dL [Reference Range: 125 - 200 mg/dL]

Remarks: Elevated blood glucose and HbA1c flagged for clinical correlation and physician review.`;
  }
}

module.exports = new DocumentProcessor();
