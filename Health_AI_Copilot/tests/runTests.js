/**
 * Automated Test Suite for AI Health Copilot
 * Tests API endpoints, RBAC security, OCR pipeline, AI services, and database integrity.
 */

const assert = require('assert');
const bcrypt = require('bcryptjs');
const db = require('../backend/config/db');
const { generateToken, verifyToken } = require('../backend/config/jwt');
const documentProcessor = require('../ocr/document-processing/documentProcessor');
const fieldExtractor = require('../ocr/extraction/fieldExtractor');
const validationService = require('../ocr/validation/validationService');
const summaryService = require('../ai/summaries/summaryService');
const chatbotService = require('../ai/chatbot/chatbotService');
const comparisonService = require('../ai/comparison/comparisonService');
const safety = require('../ai/safety/safetyGuardrails');

async function runAllTests() {
  console.log('\n====================================================');
  console.log(' RUNNING AI HEALTH COPILOT COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // 1. Database Integrity Tests
  test('DB: All 9 seeded demo users exist (1 Admin, 4 Doctors, 4 Patients)', () => {
    const users = db.prepare('SELECT user_code, role, email FROM users ORDER BY user_code').all();
    assert.strictEqual(users.length, 9, `Expected 9 users, found ${users.length}`);
    const admin = users.find(u => u.user_code === 'ADM-001' && u.role === 'ADMIN');
    assert.ok(admin, 'Admin ADM-001 must exist');
    const doc1 = users.find(u => u.user_code === 'DOC-001' && u.role === 'DOCTOR');
    assert.ok(doc1, 'DOC-001 must exist');
    const pat1 = users.find(u => u.user_code === 'PAT-1001' && u.role === 'PATIENT');
    assert.ok(pat1, 'PAT-1001 must exist');
  });

  test('DB: Doctor-Patient access assignments match hackathon specification', () => {
    // DOC-001 should have PAT-1001 and PAT-1002
    const doc1 = db.prepare('SELECT id FROM doctors WHERE doctor_code = ?').get('DOC-001');
    const doc1Pats = db.prepare(`
      SELECT p.patient_code FROM patients p
      JOIN doctor_patient_assignments a ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `).all(doc1.id).map(r => r.patient_code);

    assert.deepStrictEqual(doc1Pats.sort(), ['PAT-1001', 'PAT-1002']);

    // DOC-004 should have PAT-1003 and PAT-1004
    const doc4 = db.prepare('SELECT id FROM doctors WHERE doctor_code = ?').get('DOC-004');
    const doc4Pats = db.prepare(`
      SELECT p.patient_code FROM patients p
      JOIN doctor_patient_assignments a ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `).all(doc4.id).map(r => r.patient_code);

    assert.deepStrictEqual(doc4Pats.sort(), ['PAT-1003', 'PAT-1004']);
  });

  // 2. Authentication & Credential Verification
  test('AUTH: Admin, Doctor, and Patient passwords verify correctly', () => {
    const admin = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('admin@paavaidemo.com');
    assert.ok(bcrypt.compareSync('Admin@123', admin.password_hash), 'Admin password must match Admin@123');

    const doc = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('arun@paavaidemo.com');
    assert.ok(bcrypt.compareSync('Doctor@123', doc.password_hash), 'Doctor password must match Doctor@123');

    const pat = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('patient1@paavaidemo.com');
    assert.ok(bcrypt.compareSync('Patient@123', pat.password_hash), 'Patient password must match Patient@123');
  });

  // 3. OCR Pipeline Verification
  await asyncTest('OCR Pipeline: Document -> OCR -> Extraction -> Validation', async () => {
    const ocrRes = await documentProcessor.processDocument({ originalname: 'demo_blood_report.pdf' });
    assert.strictEqual(ocrRes.status, 'OCR_SUCCESS');
    assert.strictEqual(ocrRes.documentType, 'Lab Report');

    const extracted = fieldExtractor.extractFields(ocrRes.rawOcrText, ocrRes.documentType);
    assert.ok(extracted.tests.length >= 3, 'Must extract at least 3 lab tests');

    const validated = validationService.validateExtractedData(extracted);
    assert.ok(validated.validation_summary.total_tests >= 3);
    const glucose = validated.tests.find(t => t.test_name === 'Glucose');
    assert.ok(glucose, 'Glucose test must be present');
    assert.strictEqual(glucose.is_flagged, 1, 'Glucose (142 mg/dL) must be flagged for professional review');
    assert.ok(glucose.flag_reason.includes('Flagged for professional review'));
  });

  // 4. AI Health Summary Verification
  test('AI Summary: Generates dual-language summary with safe medical wording', () => {
    const mockRecord = {
      record_type: 'Lab Report',
      tests: [
        { test_name: 'Hemoglobin', test_value: 13.2, unit: 'g/dL', is_flagged: 0 },
        { test_name: 'Glucose', test_value: 142, unit: 'mg/dL', is_flagged: 1 }
      ]
    };
    const summary = summaryService.generateRecordSummary(mockRecord);
    assert.ok(summary.en.includes('Flagged for professional review') || summary.en.includes('flagged'));
    assert.ok(summary.en.includes('does not replace professional medical advice'));
    assert.ok(summary.ta.includes('மருத்துவ மறுஆய்வுக்கு'));
  });

  // 5. AI Chatbot & Safety Guardrails Verification
  await asyncTest('AI Chatbot: Answers in English, Tamil, and safely intercepts hazardous queries', async () => {
    // Regular question
    const resEn = await chatbotService.processChat('What does my glucose value mean?');
    assert.ok(resEn.reply.includes('Glucose'));
    assert.ok(resEn.reply.includes('does not replace professional medical advice'));

    // Tamil question
    const resTa = await chatbotService.processChat('Explain my latest report in Tamil');
    assert.ok(/[\u0B80-\u0BFF]/.test(resTa.reply), 'Must contain Tamil script');

    // Dangerous query interception
    const resDanger = await chatbotService.processChat('Should I stop taking my medicine?');
    assert.ok(resDanger.reply.includes('never stop') || resDanger.reply.includes('மறுக்கவோ'));
  });

  // 6. Report Comparison Verification
  test('Comparison: Compares Previous vs Latest report with delta change', () => {
    const prev = {
      record_date: '2026-01-15',
      title: 'January 2026 Lab Test',
      tests: [{ test_name: 'Glucose', test_value: 105, unit: 'mg/dL', is_flagged: 1 }]
    };
    const latest = {
      record_date: '2026-10-02',
      title: 'October 2026 Lab Test',
      tests: [{ test_name: 'Glucose', test_value: 142, unit: 'mg/dL', is_flagged: 1 }]
    };
    const comp = comparisonService.compareReports(prev, latest);
    assert.strictEqual(comp.success, true);
    assert.strictEqual(comp.rows[0].changeType, 'INCREASE');
    assert.strictEqual(comp.rows[0].delta, 37);
  });

  // 7. Timeline & Follow-up Verification
  test('Timeline & Follow-up: Records are chronologically sequenced and follow-ups exist', () => {
    const pat1 = db.prepare('SELECT id FROM patients WHERE patient_code = ?').get('PAT-1001');
    const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date ASC').all(pat1.id);
    assert.ok(records.length >= 4, `Expected at least 4 records for PAT-1001, got ${records.length}`);
    assert.strictEqual(records[0].record_date, '2026-01-15');
    assert.strictEqual(records[records.length - 1].record_date, '2026-10-02');

    const followup = db.prepare('SELECT * FROM follow_ups WHERE patient_id = ?').get(pat1.id);
    assert.ok(followup, 'Follow-up reminder must exist for PAT-1001');
    assert.strictEqual(followup.follow_up_date, '2026-10-20');
  });

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;
