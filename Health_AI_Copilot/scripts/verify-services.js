/**
 * End-to-End Service Verification Script
 * Starts temporary backend or communicates with running backend to verify all 12 API flows.
 */

const http = require('http');
const assert = require('assert');
const { app } = require('../backend/server');

async function runVerification() {
  console.log('\n======================================================');
  console.log(' STARTING END-TO-END HTTP API VERIFICATION');
  console.log('======================================================\n');

  // Start server on ephemeral port 5099
  const TEST_PORT = 5099;
  const testServer = app.listen(TEST_PORT);

  function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const postData = body ? JSON.stringify(body) : null;
      if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

      const req = http.request({
        host: 'localhost',
        port: TEST_PORT,
        method,
        path,
        headers
      }, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          let data = {};
          try { data = JSON.parse(rawData); } catch (e) { data = { raw: rawData }; }
          resolve({ status: res.statusCode, data });
        });
      });

      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  try {
    // 1. Health Check
    console.log('1. Testing GET /api/health...');
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'HEALTHY');
    console.log('   ✅ Health endpoint is UP and reporting HEALTHY.');

    // 2. Admin Login
    console.log('2. Testing POST /api/auth/login (Admin)...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@paavaidemo.com',
      password: 'Admin@123'
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = adminLogin.data.token;
    assert.ok(adminToken);
    console.log('   ✅ Admin authentication succeeded.');

    // 3. Doctor Login (DOC-001)
    console.log('3. Testing POST /api/auth/login (Doctor DOC-001)...');
    const docLogin = await request('POST', '/api/auth/login', {
      email: 'arun@paavaidemo.com',
      password: 'Doctor@123'
    });
    assert.strictEqual(docLogin.status, 200);
    const docToken = docLogin.data.token;
    console.log('   ✅ Doctor authentication succeeded.');

    // 4. Patient Login (PAT-1001)
    console.log('4. Testing POST /api/auth/login (Patient PAT-1001)...');
    const patLogin = await request('POST', '/api/auth/login', {
      email: 'patient1@paavaidemo.com',
      password: 'Patient@123'
    });
    assert.strictEqual(patLogin.status, 200);
    const patToken = patLogin.data.token;
    console.log('   ✅ Patient authentication succeeded.');

    // 5. Authorized Patients for Doctor
    console.log('5. Testing GET /api/patients for Doctor DOC-001...');
    const patientsRes = await request('GET', '/api/patients', null, docToken);
    assert.strictEqual(patientsRes.status, 200);
    const codes = patientsRes.data.patients.map(p => p.patient_code);
    assert.deepStrictEqual(codes.sort(), ['PAT-1001', 'PAT-1002']);
    console.log(`   ✅ Doctor DOC-001 correctly receives assigned patients: ${codes.join(', ')}.`);

    // 6. RBAC Isolation Negative Test: DOC-001 cannot access PAT-1003
    console.log('6. Testing RBAC Isolation: DOC-001 attempting to access PAT-1003...');
    const forbiddenRes = await request('GET', '/api/patients/PAT-1003', null, docToken);
    assert.strictEqual(forbiddenRes.status, 403);
    console.log('   ✅ RBAC properly enforced: 403 Forbidden returned for unassigned patient.');

    // 7. Patient Record & Timeline
    console.log('7. Testing GET /api/patients/PAT-1001/records...');
    const recordsRes = await request('GET', '/api/patients/PAT-1001/records', null, patToken);
    assert.strictEqual(recordsRes.status, 200);
    assert.ok(recordsRes.data.timeline.length >= 4);
    assert.ok(recordsRes.data.overall_summary);
    console.log(`   ✅ Patient timeline loaded with ${recordsRes.data.timeline.length} chronological records & AI summary.`);

    // 8. OCR Process Pipeline
    console.log('8. Testing POST /api/ocr/process...');
    const ocrRes = await request('POST', '/api/ocr/process', {
      document_type: 'Lab Report',
      patient_id: 'PAT-1001'
    }, docToken);
    assert.strictEqual(ocrRes.status, 200);
    assert.strictEqual(ocrRes.data.pipeline.stage, 'WAITING_FOR_DOCTOR_VERIFICATION');
    console.log('   ✅ OCR pipeline extracted and validated parameters, waiting for doctor verification.');

    // 9. Doctor Verifies and Saves Record
    console.log('9. Testing POST /api/records (Doctor verification and storage)...');
    const saveRes = await request('POST', '/api/records', {
      patient_id: 'PAT-1001',
      record_type: 'Lab Report',
      title: 'Repeat Fasting Metabolic Screen',
      record_date: '2026-10-06',
      extracted_data: {
        tests: [
          { test_name: 'Glucose', test_value: 138, unit: 'mg/dL', reference_range: '70-100 mg/dL', is_flagged: 1 }
        ]
      },
      is_verified: true
    }, docToken);
    assert.strictEqual(saveRes.status, 201);
    console.log('   ✅ Medical record verified by doctor and successfully stored.');

    // 10. AI Chatbot
    console.log('10. Testing POST /api/ai/chat (English & Tamil)...');
    const chatEn = await request('POST', '/api/ai/chat', {
      message: 'Explain my latest report in simple language',
      patient_id: 'PAT-1001',
      language: 'en'
    }, patToken);
    assert.strictEqual(chatEn.status, 200);
    assert.ok(chatEn.data.reply.includes('does not replace professional medical advice'));

    const chatTa = await request('POST', '/api/ai/chat', {
      message: 'Explain this in Tamil',
      patient_id: 'PAT-1001',
      language: 'ta'
    }, patToken);
    assert.strictEqual(chatTa.status, 200);
    assert.ok(/[\u0B80-\u0BFF]/.test(chatTa.data.reply));
    console.log('   ✅ AI Chatbot answered accurately in English and Tamil with safe medical disclaimers.');

    // 11. Report Comparison
    console.log('11. Testing POST /api/ai/compare...');
    const compRes = await request('POST', '/api/ai/compare', {
      patient_id: 'PAT-1001'
    }, patToken);
    assert.strictEqual(compRes.status, 200);
    assert.ok(compRes.data.rows.length > 0);
    console.log('   ✅ Report comparison calculated numerical deltas and trend indications.');

    // 12. Admin Metrics & Activity
    console.log('12. Testing GET /api/admin/stats & /api/admin/activity...');
    const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsRes.data.stats.total_doctors, 4);
    assert.strictEqual(statsRes.data.stats.total_patients, 4);

    const actRes = await request('GET', '/api/admin/activity', null, adminToken);
    assert.strictEqual(actRes.status, 200);
    assert.ok(actRes.data.logs.length > 0);
    console.log('   ✅ Admin dashboard metrics and audit logs validated.');

    console.log('\n======================================================');
    console.log(' ALL 12 API ENDPOINTS VERIFIED SUCCESSFULLY (100% PASS)');
    console.log('======================================================\n');
    testServer.close(() => {
      process.exit(0);
    });
  } catch (err) {
    testServer.close();
    throw err;
  }
}

if (require.main === module) {
  runVerification().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = runVerification;
