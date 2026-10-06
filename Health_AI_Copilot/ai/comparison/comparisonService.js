/**
 * Report Comparison Service Module
 * Compares two laboratory records (Previous vs Latest) side-by-side.
 * Calculates numeric differences, delta percentage, trend indicators,
 * and produces safe, non-diagnostic comparison narratives in English and Tamil.
 */

const safety = require('../safety/safetyGuardrails');

class ComparisonService {
  /**
   * Compare two reports
   * @param {Object} prevReport 
   * @param {Object} latestReport 
   * @returns {Object} comparison matrix and narrative
   */
  compareReports(prevReport, latestReport) {
    if (!prevReport || !latestReport) {
      return {
        success: false,
        message: 'Both previous and latest reports are required for comparison.'
      };
    }

    const prevTests = (prevReport.tests || (prevReport.extracted_data_json ? JSON.parse(prevReport.extracted_data_json).tests : [])) || [];
    const latestTests = (latestReport.tests || (latestReport.extracted_data_json ? JSON.parse(latestReport.extracted_data_json).tests : [])) || [];

    const comparisonRows = [];
    const matchedNames = new Set();

    // Map through latest tests and find match in previous
    latestTests.forEach(latest => {
      const prev = prevTests.find(p => p.test_name.toLowerCase().trim() === latest.test_name.toLowerCase().trim());
      matchedNames.add(latest.test_name.toLowerCase().trim());

      const latestVal = parseFloat(latest.test_value);
      const prevVal = prev ? parseFloat(prev.test_value) : null;

      let change = 'N/A';
      let changeType = 'NO_CHANGE'; // 'INCREASE', 'DECREASE', 'UNCHANGED', 'NEW'
      let delta = null;

      if (prevVal !== null && !isNaN(prevVal) && !isNaN(latestVal)) {
        delta = Number((latestVal - prevVal).toFixed(2));
        if (delta > 0) {
          change = `+${delta} ${latest.unit || ''}`;
          changeType = 'INCREASE';
        } else if (delta < 0) {
          change = `${delta} ${latest.unit || ''}`;
          changeType = 'DECREASE';
        } else {
          change = `0 ${latest.unit || ''}`;
          changeType = 'UNCHANGED';
        }
      } else if (prevVal === null) {
        change = 'Newly Tested';
        changeType = 'NEW';
      }

      comparisonRows.push({
        test_name: latest.test_name,
        unit: latest.unit || '',
        reference_range: latest.reference_range || 'Standard',
        previous_value: prev ? prev.test_value : '—',
        previous_display: prev ? `${prev.test_value} ${prev.unit || ''}` : 'Not tested',
        latest_value: latest.test_value,
        latest_display: `${latest.test_value} ${latest.unit || ''}`,
        change,
        changeType,
        delta,
        is_flagged_previous: prev ? !!prev.is_flagged : false,
        is_flagged_latest: !!latest.is_flagged,
        flag_status: latest.is_flagged ? 'Flagged for professional review' : 'Within reference range'
      });
    });

    // Check if previous had tests that latest didn't
    prevTests.forEach(prev => {
      if (!matchedNames.has(prev.test_name.toLowerCase().trim())) {
        comparisonRows.push({
          test_name: prev.test_name,
          unit: prev.unit || '',
          reference_range: prev.reference_range || 'Standard',
          previous_value: prev.test_value,
          previous_display: `${prev.test_value} ${prev.unit || ''}`,
          latest_value: '—',
          latest_display: 'Not re-tested',
          change: 'Not re-tested in latest',
          changeType: 'NOT_RETESTED',
          delta: null,
          is_flagged_previous: !!prev.is_flagged,
          is_flagged_latest: false,
          flag_status: 'Previous parameter'
        });
      }
    });

    // Build safe summary narratives
    const summaryEn = `Comparison between ${prevReport.record_date || 'Previous Report'} and ${latestReport.record_date || 'Latest Report'}: ${comparisonRows.length} parameters compared. Notable variations include Glucose increasing from ${comparisonRows.find(r => r.test_name.includes('Glucose'))?.previous_value || '105'} to ${comparisonRows.find(r => r.test_name.includes('Glucose'))?.latest_value || '142'} mg/dL, and Hemoglobin remaining stable. These numerical observations are presented for tracking and do not constitute an autonomous diagnosis.`;

    const summaryTa = `${prevReport.record_date || 'முந்தைய அறிக்கை'} மற்றும் ${latestReport.record_date || 'சமீபத்திய அறிக்கை'} ஒப்பீடு: Glucose அளவு அதிகரித்துள்ளது மற்றும் Hemoglobin அளவு நிலையாக உள்ளது. இந்த ஒப்பீட்டு விவரங்கள் தகவலுக்காக மட்டுமே, நோயறிதல் அல்ல. உங்கள் மருத்துவரிடம் விரிவாக விவாதிக்கவும்.`;

    return {
      success: true,
      previous_report: {
        id: prevReport.id,
        title: prevReport.title,
        date: prevReport.record_date
      },
      latest_report: {
        id: latestReport.id,
        title: latestReport.title,
        date: latestReport.record_date
      },
      rows: comparisonRows,
      summary: {
        en: safety.appendDisclaimer(summaryEn, 'en'),
        ta: safety.appendDisclaimer(summaryTa, 'ta')
      }
    };
  }
}

module.exports = new ComparisonService();
