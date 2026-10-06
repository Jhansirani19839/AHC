const bcrypt = require('bcryptjs');
const db = require('../../backend/config/db');

function seedDatabase() {
  console.log('--- Starting Seed Process for Paavai Demo Hospital ---');

  // Clear existing data safely
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM follow_ups;
    DELETE FROM diagnostic_records;
    DELETE FROM prescriptions;
    DELETE FROM medical_records;
    DELETE FROM doctor_patient_assignments;
    DELETE FROM patients;
    DELETE FROM doctors;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123', salt);
  const doctorHash = bcrypt.hashSync('Doctor@123', salt);
  const patientHash = bcrypt.hashSync('Patient@123', salt);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (user_code, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Admin
  const adminRes = insertUser.run('ADM-001', 'Hospital Admin', 'admin@paavaidemo.com', adminHash, 'ADMIN');
  const adminUserId = adminRes.lastInsertRowid;

  // Doctors
  const doc1User = insertUser.run('DOC-001', 'Dr. Arun Kumar', 'arun@paavaidemo.com', doctorHash, 'DOCTOR');
  const doc2User = insertUser.run('DOC-002', 'Dr. Priya', 'priya@paavaidemo.com', doctorHash, 'DOCTOR');
  const doc3User = insertUser.run('DOC-003', 'Dr. Karthik', 'karthik@paavaidemo.com', doctorHash, 'DOCTOR');
  const doc4User = insertUser.run('DOC-004', 'Dr. Meena', 'meena@paavaidemo.com', doctorHash, 'DOCTOR');

  // Patients
  const pat1User = insertUser.run('PAT-1001', 'Demo Patient 1', 'patient1@paavaidemo.com', patientHash, 'PATIENT');
  const pat2User = insertUser.run('PAT-1002', 'Demo Patient 2', 'patient2@paavaidemo.com', patientHash, 'PATIENT');
  const pat3User = insertUser.run('PAT-1003', 'Demo Patient 3', 'patient3@paavaidemo.com', patientHash, 'PATIENT');
  const pat4User = insertUser.run('PAT-1004', 'Demo Patient 4', 'patient4@paavaidemo.com', patientHash, 'PATIENT');

  // 2. Insert Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (doctor_code, user_id, name, email, department, specialization, phone, hospital_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const d1 = insertDoctor.run('DOC-001', doc1User.lastInsertRowid, 'Dr. Arun Kumar', 'arun@paavaidemo.com', 'Internal Medicine', 'General Physician & Diabetology', '+91 94432 10001', 'Paavai Demo Hospital');
  const d2 = insertDoctor.run('DOC-002', doc2User.lastInsertRowid, 'Dr. Priya', 'priya@paavaidemo.com', 'Cardiology', 'Consultant Cardiologist', '+91 94432 10002', 'Paavai Demo Hospital');
  const d3 = insertDoctor.run('DOC-003', doc3User.lastInsertRowid, 'Dr. Karthik', 'karthik@paavaidemo.com', 'Endocrinology', 'Diabetologist & Specialist', '+91 94432 10003', 'Paavai Demo Hospital');
  const d4 = insertDoctor.run('DOC-004', doc4User.lastInsertRowid, 'Dr. Meena', 'meena@paavaidemo.com', 'Pathology & Diagnostics', 'Consultant Pathologist', '+91 94432 10004', 'Paavai Demo Hospital');

  const doc1Id = d1.lastInsertRowid;
  const doc2Id = d2.lastInsertRowid;
  const doc3Id = d3.lastInsertRowid;
  const doc4Id = d4.lastInsertRowid;

  // 3. Insert Patients
  const insertPatient = db.prepare(`
    INSERT INTO patients (patient_code, user_id, name, email, age, gender, blood_group, phone, emergency_contact, abha_id, health_id, external_record_id, hospital_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const p1 = insertPatient.run('PAT-1001', pat1User.lastInsertRowid, 'Demo Patient 1', 'patient1@paavaidemo.com', 42, 'Male', 'B+', '+91 98765 43210', '+91 98765 43219', '91-8273-1940-5812', 'pat1@abdm', 'EXT-PAAVAI-1001', 'Paavai Demo Hospital');
  const p2 = insertPatient.run('PAT-1002', pat2User.lastInsertRowid, 'Demo Patient 2', 'patient2@paavaidemo.com', 36, 'Female', 'O+', '+91 98765 43211', '+91 98765 43218', '91-4921-8301-4472', 'pat2@abdm', 'EXT-PAAVAI-1002', 'Paavai Demo Hospital');
  const p3 = insertPatient.run('PAT-1003', pat3User.lastInsertRowid, 'Demo Patient 3', 'patient3@paavaidemo.com', 58, 'Male', 'A+', '+91 98765 43212', '+91 98765 43217', '91-6102-7492-3310', 'pat3@abdm', 'EXT-PAAVAI-1003', 'Paavai Demo Hospital');
  const p4 = insertPatient.run('PAT-1004', pat4User.lastInsertRowid, 'Demo Patient 4', 'patient4@paavaidemo.com', 29, 'Female', 'AB+', '+91 98765 43213', '+91 98765 43216', '91-3091-6548-1120', 'pat4@abdm', 'EXT-PAAVAI-1004', 'Paavai Demo Hospital');

  const pat1Id = p1.lastInsertRowid;
  const pat2Id = p2.lastInsertRowid;
  const pat3Id = p3.lastInsertRowid;
  const pat4Id = p4.lastInsertRowid;

  // 4. Doctor-Patient Assignments
  // DOC-001: PAT-1001, PAT-1002
  // DOC-002: PAT-1001, PAT-1003
  // DOC-003: PAT-1002, PAT-1004
  // DOC-004: PAT-1003, PAT-1004
  const assignDoc = db.prepare(`INSERT INTO doctor_patient_assignments (doctor_id, patient_id) VALUES (?, ?)`);
  assignDoc.run(doc1Id, pat1Id);
  assignDoc.run(doc1Id, pat2Id);

  assignDoc.run(doc2Id, pat1Id);
  assignDoc.run(doc2Id, pat3Id);

  assignDoc.run(doc3Id, pat2Id);
  assignDoc.run(doc3Id, pat4Id);

  assignDoc.run(doc4Id, pat3Id);
  assignDoc.run(doc4Id, pat4Id);

  // 5. Medical Records, Prescriptions, Diagnostic Records
  const insertRecord = db.prepare(`
    INSERT INTO medical_records (record_code, patient_id, doctor_id, record_type, title, record_date, file_name, file_path, ocr_raw_text, extracted_data_json, is_verified, verified_by_doctor_id, verified_at, ai_summary, ai_summary_ta, fhir_resource_type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDiagnostic = db.prepare(`
    INSERT INTO diagnostic_records (medical_record_id, patient_id, test_name, test_value, test_value_display, unit, reference_range, is_flagged, flag_reason, test_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPrescription = db.prepare(`
    INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, instructions_ta, prescription_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // PATIENT 1 RECORDS:
  // REC 1: Jan 2026 Blood Test
  const r1Json = JSON.stringify({
    patient_name: 'Demo Patient 1',
    patient_id: 'PAT-1001',
    report_date: '2026-01-15',
    doctor_name: 'Dr. Arun Kumar',
    tests: [
      { test_name: 'Hemoglobin', test_value: 13.5, unit: 'g/dL', reference_range: '12-16 g/dL', is_flagged: 0 },
      { test_name: 'Fasting Blood Sugar', test_value: 105, unit: 'mg/dL', reference_range: '70-100 mg/dL', is_flagged: 1, flag_reason: 'Flagged for professional review: Above standard reference range' },
      { test_name: 'Total WBC', test_value: 7200, unit: '/mcL', reference_range: '4000-11000 /mcL', is_flagged: 0 },
      { test_name: 'Platelets', test_value: 250000, unit: '/mcL', reference_range: '150000-450000 /mcL', is_flagged: 0 }
    ]
  });

  const rec1 = insertRecord.run(
    'REC-1001-01', pat1Id, doc1Id, 'Lab Report', 'Baseline Blood Test (CBC & Fasting Sugar)', '2026-01-15',
    'cbc_fasting_jan2026.pdf', 'uploads/sample_cbc_jan2026.pdf',
    'PAAVAI DEMO HOSPITAL LAB REPORT\nPatient: Demo Patient 1 (PAT-1001)\nDate: 2026-01-15\nHemoglobin: 13.5 g/dL (12-16)\nFasting Blood Sugar: 105 mg/dL (70-100)\nTotal WBC: 7200 /mcL (4000-11000)\nPlatelets: 250000 /mcL (150000-450000)',
    r1Json, 1, doc1Id, '2026-01-15 11:30:00',
    'Baseline laboratory workup shows blood counts within expected ranges. Fasting glucose is slightly above standard reference levels (105 mg/dL vs 70-100 mg/dL) and flagged for professional review.',
    'அடிப்படை ஆய்வக பரிசோதனையில் ரத்த அணுக்களின் அளவுகள் இயல்பாக உள்ளன. Fasting glucose அளவு (105 mg/dL) reference range-ஐ விட சற்று அதிகமாக உள்ளது. இதைப் பற்றி மருத்துவரிடம் ஆலோசிக்கவும்.',
    'DiagnosticReport', 'verified'
  );

  insertDiagnostic.run(rec1.lastInsertRowid, pat1Id, 'Hemoglobin', 13.5, '13.5', 'g/dL', '12-16 g/dL', 0, null, '2026-01-15');
  insertDiagnostic.run(rec1.lastInsertRowid, pat1Id, 'Fasting Blood Sugar', 105, '105', 'mg/dL', '70-100 mg/dL', 1, 'Flagged for professional review', '2026-01-15');
  insertDiagnostic.run(rec1.lastInsertRowid, pat1Id, 'Total WBC', 7200, '7,200', '/mcL', '4000-11000 /mcL', 0, null, '2026-01-15');
  insertDiagnostic.run(rec1.lastInsertRowid, pat1Id, 'Platelets', 250000, '250,000', '/mcL', '150000-450000 /mcL', 0, null, '2026-01-15');

  // REC 2: March 2026 Prescription
  const r2Json = JSON.stringify({
    patient_name: 'Demo Patient 1',
    patient_id: 'PAT-1001',
    report_date: '2026-03-10',
    doctor_name: 'Dr. Arun Kumar',
    medications: [
      { medication_name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily after meals', duration: '60 days', instructions: 'Take with food to avoid gastric discomfort.' },
      { medication_name: 'Multivitamin Complex', dosage: '1 tablet', frequency: 'Once daily morning', duration: '30 days', instructions: 'Take after breakfast.' }
    ]
  });

  const rec2 = insertRecord.run(
    'REC-1001-02', pat1Id, doc1Id, 'Prescription', 'Prescription - Glycemic Management & Supplements', '2026-03-10',
    'prescription_march2026.pdf', 'uploads/prescription_march2026.pdf',
    'PAAVAI DEMO HOSPITAL OUTPATIENT PRESCRIPTION\nPatient: Demo Patient 1\nDate: 2026-03-10\nRx:\n1. Tab Metformin 500mg 1-0-1 after meals (60 days)\n2. Tab Multivitamin 1-0-0 morning (30 days)\nAdvice: Diet control, moderate walking.',
    r2Json, 1, doc1Id, '2026-03-10 10:15:00',
    'Prescription issued for glycemic balance support and vitamin supplementation. Includes Metformin 500mg and daily multivitamin. Always follow your prescribing doctor\'s dosage directions.',
    'சர்க்கரை அளவை சமப்படுத்த மற்றும் சத்துக்காக மருத்துவர் பரிந்துரை செய்துள்ள மருந்துச் சீட்டு. Metformin 500mg மற்றும் Multivitamin ஆகியவை அடங்கும். மருத்துவரின் வழிகாட்டுதலைப் பின்பற்றவும்.',
    'MedicationRequest', 'verified'
  );

  insertPrescription.run(rec2.lastInsertRowid, pat1Id, doc1Id, 'Metformin', '500 mg', 'Twice daily (1-0-1)', '60 days', 'Take with or right after meals', 'உணவுக்குப் பின் உட்கொள்ளவும்', '2026-03-10');
  insertPrescription.run(rec2.lastInsertRowid, pat1Id, doc1Id, 'Multivitamin Complex', '1 Tablet', 'Once daily (1-0-0)', '30 days', 'Take in the morning after breakfast', 'காலை உணவுக்குப் பின் உட்கொள்ளவும்', '2026-03-10');

  // REC 3: June 2026 Diagnostic Report
  const r3Json = JSON.stringify({
    patient_name: 'Demo Patient 1',
    patient_id: 'PAT-1001',
    report_date: '2026-06-20',
    doctor_name: 'Dr. Priya',
    tests: [
      { test_name: 'Heart Rate', test_value: 74, unit: 'bpm', reference_range: '60-100 bpm', is_flagged: 0 },
      { test_name: 'Systolic BP', test_value: 124, unit: 'mmHg', reference_range: '90-120 mmHg', is_flagged: 0 },
      { test_name: 'Diastolic BP', test_value: 82, unit: 'mmHg', reference_range: '60-80 mmHg', is_flagged: 0 }
    ],
    diagnosis_text: 'Resting 12-lead ECG: Normal sinus rhythm. No ST-T segment elevation or acute ischemic changes detected. Stable hemodynamics.'
  });

  const rec3 = insertRecord.run(
    'REC-1001-03', pat1Id, doc2Id, 'Diagnostic Report', 'Diagnostic Report - Cardiovascular Screening & ECG', '2026-06-20',
    'ecg_cardio_june2026.pdf', 'uploads/ecg_cardio_june2026.pdf',
    'PAAVAI DEMO HOSPITAL CARDIOLOGY DEPT\nPatient: Demo Patient 1\nDate: 2026-06-20\nECG Impression: Normal Sinus Rhythm, HR 74 bpm\nBlood Pressure: 124/82 mmHg\nFindings: No significant ischemic changes.',
    r3Json, 1, doc2Id, '2026-06-20 14:00:00',
    'Routine cardiovascular evaluation shows normal sinus rhythm with healthy resting heart rate (74 bpm) and borderline blood pressure (124/82 mmHg). Overall cardiac screening is stable.',
    'வழக்கமான இதய பரிசோதனையில் இயல்பான இதயத் துடிப்பு (74 bpm) மற்றும் நிலையான ரத்த அழுத்தம் (124/82 mmHg) காணப்படுகிறது. பரிசோதனை முடிவுகள் திருப்திகரமாக உள்ளன.',
    'DiagnosticReport', 'verified'
  );

  insertDiagnostic.run(rec3.lastInsertRowid, pat1Id, 'Heart Rate', 74, '74', 'bpm', '60-100 bpm', 0, null, '2026-06-20');
  insertDiagnostic.run(rec3.lastInsertRowid, pat1Id, 'Systolic BP', 124, '124', 'mmHg', '90-120 mmHg', 0, null, '2026-06-20');
  insertDiagnostic.run(rec3.lastInsertRowid, pat1Id, 'Diastolic BP', 82, '82', 'mmHg', '60-80 mmHg', 0, null, '2026-06-20');

  // REC 4: October 2026 Blood Report (Latest)
  const r4Json = JSON.stringify({
    patient_name: 'Demo Patient 1',
    patient_id: 'PAT-1001',
    report_date: '2026-10-02',
    doctor_name: 'Dr. Arun Kumar',
    tests: [
      { test_name: 'Hemoglobin', test_value: 13.2, unit: 'g/dL', reference_range: '12-16 g/dL', is_flagged: 0 },
      { test_name: 'Glucose', test_value: 142, unit: 'mg/dL', reference_range: '70-100 mg/dL', is_flagged: 1, flag_reason: 'Flagged for professional review: Above standard reference range' },
      { test_name: 'HbA1c', test_value: 6.8, unit: '%', reference_range: '4.0-5.6 %', is_flagged: 1, flag_reason: 'Flagged for professional review: Above standard reference range' },
      { test_name: 'Total Cholesterol', test_value: 190, unit: 'mg/dL', reference_range: '125-200 mg/dL', is_flagged: 0 }
    ]
  });

  const rec4 = insertRecord.run(
    'REC-1001-04', pat1Id, doc1Id, 'Lab Report', 'Comprehensive Metabolic Panel & Glycemic Re-evaluation', '2026-10-02',
    'cmp_glycemic_oct2026.pdf', 'uploads/cmp_glycemic_oct2026.pdf',
    'PAAVAI DEMO HOSPITAL CENTRAL LABORATORY\nPatient Name: Demo Patient 1 | ID: PAT-1001\nReport Date: 2026-10-02\nDoctor: Dr. Arun Kumar\n\nTEST RESULTS:\nHemoglobin: 13.2 g/dL [Reference Range: 12-16 g/dL]\nGlucose: 142 mg/dL [Reference Range: 70-100 mg/dL] *HIGH*\nHbA1c: 6.8 % [Reference Range: 4.0-5.6 %] *HIGH*\nTotal Cholesterol: 190 mg/dL [Reference Range: 125-200 mg/dL]',
    r4Json, 1, doc1Id, '2026-10-02 16:45:00',
    'Your latest blood report contains several recorded values. Two values (Glucose at 142 mg/dL and HbA1c at 6.8%) are outside the sample reference range and have been flagged for professional review. Hemoglobin and Cholesterol are within expected limits. Please discuss this report with your healthcare professional.',
    'உங்கள் சமீபத்திய ரத்தப் பரிசோதனையில் Glucose (142 mg/dL) மற்றும் HbA1c (6.8%) அளவுகள் கொடுக்கப்பட்ட reference range-ஐ விட அதிகமாக உள்ளன. இது மருத்துவ மறுஆய்வுக்கு பரிந்துரைக்கப்பட்டுள்ளது. Hemoglobin மற்றும் Cholesterol அளவுகள் சீராக உள்ளன. இதைப் பற்றி மருத்துவரிடம் ஆலோசிக்கவும்.',
    'Observation', 'verified'
  );

  insertDiagnostic.run(rec4.lastInsertRowid, pat1Id, 'Hemoglobin', 13.2, '13.2', 'g/dL', '12-16 g/dL', 0, null, '2026-10-02');
  insertDiagnostic.run(rec4.lastInsertRowid, pat1Id, 'Glucose', 142, '142', 'mg/dL', '70-100 mg/dL', 1, 'Flagged for professional review: Above reference range', '2026-10-02');
  insertDiagnostic.run(rec4.lastInsertRowid, pat1Id, 'HbA1c', 6.8, '6.8', '%', '4.0-5.6 %', 1, 'Flagged for professional review: Above reference range', '2026-10-02');
  insertDiagnostic.run(rec4.lastInsertRowid, pat1Id, 'Total Cholesterol', 190, '190', 'mg/dL', '125-200 mg/dL', 0, null, '2026-10-02');

  // PATIENT 2 RECORDS:
  const p2r1Json = JSON.stringify({
    patient_name: 'Demo Patient 2',
    patient_id: 'PAT-1002',
    report_date: '2026-02-14',
    doctor_name: 'Dr. Arun Kumar',
    tests: [
      { test_name: 'TSH (Thyroid Stimulating Hormone)', test_value: 5.6, unit: 'uIU/mL', reference_range: '0.4-4.0 uIU/mL', is_flagged: 1, flag_reason: 'Flagged for professional review: Above normal range' },
      { test_name: 'Hemoglobin', test_value: 11.4, unit: 'g/dL', reference_range: '12-15 g/dL', is_flagged: 1, flag_reason: 'Flagged for professional review: Below normal range' },
      { test_name: 'Serum Ferritin', test_value: 18, unit: 'ng/mL', reference_range: '15-150 ng/mL', is_flagged: 0 }
    ]
  });

  const p2rec1 = insertRecord.run(
    'REC-1002-01', pat2Id, doc1Id, 'Lab Report', 'Thyroid Profile & Complete Blood Count', '2026-02-14',
    'thyroid_feb2026.pdf', 'uploads/thyroid_feb2026.pdf',
    'PAAVAI DEMO HOSPITAL CLINICAL LAB\nPatient: Demo Patient 2 (PAT-1002)\nTSH: 5.6 uIU/mL (0.4-4.0)\nHemoglobin: 11.4 g/dL (12-15)\nFerritin: 18 ng/mL (15-150)',
    p2r1Json, 1, doc1Id, '2026-02-14 10:00:00',
    'Thyroid screening indicates elevated TSH (5.6 uIU/mL) and mildly reduced Hemoglobin (11.4 g/dL). Both values are flagged for clinical review.',
    'தைராய்டு பரிசோதனையில் TSH அளவு (5.6 uIU/mL) அதிகமாகவும், Hemoglobin (11.4 g/dL) சற்று குறைவாகவும் உள்ளது. மருத்துவரிடம் ஆலோசிக்கவும்.',
    'DiagnosticReport', 'verified'
  );

  insertDiagnostic.run(p2rec1.lastInsertRowid, pat2Id, 'TSH', 5.6, '5.6', 'uIU/mL', '0.4-4.0 uIU/mL', 1, 'Flagged for professional review', '2026-02-14');
  insertDiagnostic.run(p2rec1.lastInsertRowid, pat2Id, 'Hemoglobin', 11.4, '11.4', 'g/dL', '12-15 g/dL', 1, 'Flagged for professional review', '2026-02-14');

  const p2rec2 = insertRecord.run(
    'REC-1002-02', pat2Id, doc3Id, 'Prescription', 'Prescription - Thyroid & Iron Supplementation', '2026-02-18',
    'rx_p2_feb2026.pdf', 'uploads/rx_p2_feb2026.pdf',
    'PAAVAI DEMO HOSPITAL OUTPATIENT PRESCRIPTION\nPatient: Demo Patient 2\nRx:\n1. Tab Levothyroxine 25mcg 1-0-0 empty stomach\n2. Tab Ferrous Ascorbate 100mg 0-1-0 after lunch',
    JSON.stringify({ patient_name: 'Demo Patient 2', medications: [{ medication_name: 'Levothyroxine', dosage: '25 mcg', frequency: 'Once daily empty stomach', duration: '90 days' }] }),
    1, doc3Id, '2026-02-18 11:00:00',
    'Prescription for thyroid hormone optimization and iron supplementation.',
    'தைராய்டு மற்றும் இரும்புச்சத்து குறைபாட்டிற்கான மருந்து பரிந்துரை.',
    'MedicationRequest', 'verified'
  );

  insertPrescription.run(p2rec2.lastInsertRowid, pat2Id, doc3Id, 'Levothyroxine', '25 mcg', 'Once daily (1-0-0)', '90 days', 'Take early morning on an empty stomach with plain water', 'காலை வெறும் வயிற்றில் உட்கொள்ளவும்', '2026-02-18');
  insertPrescription.run(p2rec2.lastInsertRowid, pat2Id, doc3Id, 'Ferrous Ascorbate', '100 mg', 'Once daily (0-1-0)', '60 days', 'Take after lunch with citrus juice or water', 'மதிய உணவுக்குப் பின் உட்கொள்ளவும்', '2026-02-18');

  // PATIENT 3 RECORDS:
  const p3rec1 = insertRecord.run(
    'REC-1003-01', pat3Id, doc2Id, 'Lab Report', 'Lipid Panel & Cardiac Enzyme Screen', '2026-05-10',
    'lipid_may2026.pdf', 'uploads/lipid_may2026.pdf',
    'PAAVAI DEMO HOSPITAL\nPatient: Demo Patient 3 (PAT-1003)\nTotal Cholesterol: 240 mg/dL (125-200)\nTriglycerides: 210 mg/dL (50-150)\nHDL: 38 mg/dL (40-60)\nLDL: 160 mg/dL (0-100)',
    JSON.stringify({
      patient_name: 'Demo Patient 3',
      tests: [
        { test_name: 'Total Cholesterol', test_value: 240, unit: 'mg/dL', reference_range: '125-200 mg/dL', is_flagged: 1 },
        { test_name: 'Triglycerides', test_value: 210, unit: 'mg/dL', reference_range: '50-150 mg/dL', is_flagged: 1 },
        { test_name: 'LDL Cholesterol', test_value: 160, unit: 'mg/dL', reference_range: '0-100 mg/dL', is_flagged: 1 }
      ]
    }),
    1, doc2Id, '2026-05-10 12:00:00',
    'Lipid assessment reveals elevated total cholesterol, triglycerides, and LDL levels, flagged for review.',
    'கொலஸ்ட்ரால் பரிசோதனையில் அளவுகள் அதிகமாக உள்ளதால் மருத்துவ ஆலோசனை தேவைப்படுகிறது.',
    'DiagnosticReport', 'verified'
  );

  insertDiagnostic.run(p3rec1.lastInsertRowid, pat3Id, 'Total Cholesterol', 240, '240', 'mg/dL', '125-200 mg/dL', 1, 'Flagged for professional review', '2026-05-10');
  insertDiagnostic.run(p3rec1.lastInsertRowid, pat3Id, 'Triglycerides', 210, '210', 'mg/dL', '50-150 mg/dL', 1, 'Flagged for professional review', '2026-05-10');
  insertDiagnostic.run(p3rec1.lastInsertRowid, pat3Id, 'LDL Cholesterol', 160, '160', 'mg/dL', '0-100 mg/dL', 1, 'Flagged for professional review', '2026-05-10');

  // PATIENT 4 RECORDS:
  const p4rec1 = insertRecord.run(
    'REC-1004-01', pat4Id, doc3Id, 'Lab Report', 'Annual Wellness & Vitamin Screening', '2026-08-05',
    'wellness_aug2026.pdf', 'uploads/wellness_aug2026.pdf',
    'PAAVAI DEMO HOSPITAL\nPatient: Demo Patient 4 (PAT-1004)\nVitamin D3: 16 ng/mL (30-100)\nVitamin B12: 220 pg/mL (200-900)\nHemoglobin: 12.8 g/dL (12-15)',
    JSON.stringify({
      patient_name: 'Demo Patient 4',
      tests: [
        { test_name: 'Vitamin D3', test_value: 16, unit: 'ng/mL', reference_range: '30-100 ng/mL', is_flagged: 1 },
        { test_name: 'Vitamin B12', test_value: 220, unit: 'pg/mL', reference_range: '200-900 pg/mL', is_flagged: 0 },
        { test_name: 'Hemoglobin', test_value: 12.8, unit: 'g/dL', reference_range: '12-15 g/dL', is_flagged: 0 }
      ]
    }),
    1, doc3Id, '2026-08-05 09:30:00',
    'Annual wellness check indicates low Vitamin D3 (16 ng/mL) flagged for professional review. Other counts are normal.',
    'ஆண்டு உடல் பரிசோதனையில் வைட்டமின் D3 அளவு குறைவாக உள்ளது. மருத்துவ ஆலோசனை பெறவும்.',
    'DiagnosticReport', 'verified'
  );

  insertDiagnostic.run(p4rec1.lastInsertRowid, pat4Id, 'Vitamin D3', 16, '16', 'ng/mL', '30-100 ng/mL', 1, 'Flagged for professional review', '2026-08-05');

  // 6. Follow-ups
  const insertFollowUp = db.prepare(`
    INSERT INTO follow_ups (patient_id, doctor_id, follow_up_date, notes, notes_ta, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertFollowUp.run(pat1Id, doc1Id, '2026-10-20', 'Review blood glucose control, HbA1c trend, and lifestyle modifications.', 'ரத்த சர்க்கரை அளவுகள் மற்றும் வாழ்க்கைமுறை மாற்றங்களை மறுஆய்வு செய்தல்.', 'scheduled');
  insertFollowUp.run(pat2Id, doc3Id, '2026-10-25', 'Check repeat TSH and Hemoglobin response after iron therapy.', 'தைராய்டு மற்றும் இரும்புச்சத்து மருந்து எடுத்துக் கொண்டபின் மறுபரிசோதனை.', 'scheduled');
  insertFollowUp.run(pat3Id, doc2Id, '2026-11-02', 'Cardiovascular review and response to lipid-lowering therapy.', 'இதய பரிசோதனை மற்றும் கொலஸ்ட்ரால் மருந்து மறுஆய்வு.', 'scheduled');
  insertFollowUp.run(pat4Id, doc4Id, '2026-11-15', 'Evaluate Vitamin D3 replenishment and wellness routine.', 'வைட்டமின் D3 முன்னேற்றம் மற்றும் உடல்நலப் பராமரிப்பு.', 'scheduled');

  // 7. Activity Logs
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (user_id, user_code, role, action, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run(adminUserId, 'ADM-001', 'ADMIN', 'SYSTEM_INITIALIZATION', 'Hospital platform seeded with Paavai Demo Hospital datasets.', '2026-10-01 09:00:00');
  insertLog.run(doc1User.lastInsertRowid, 'DOC-001', 'DOCTOR', 'OCR_VERIFIED', 'Verified and saved Lab Report REC-1001-04 for Demo Patient 1.', '2026-10-02 16:45:00');
  insertLog.run(doc1User.lastInsertRowid, 'DOC-001', 'DOCTOR', 'FOLLOWUP_SCHEDULED', 'Scheduled follow-up on 2026-10-20 for Demo Patient 1.', '2026-10-02 16:50:00');
  insertLog.run(pat1User.lastInsertRowid, 'PAT-1001', 'PATIENT', 'SUMMARY_VIEWED', 'Patient reviewed latest AI Health Summary and Timeline.', '2026-10-03 10:15:00');
  insertLog.run(doc2User.lastInsertRowid, 'DOC-002', 'DOCTOR', 'RECORD_ACCESSED', 'Reviewed cardiovascular records for Demo Patient 3.', '2026-10-04 11:20:00');
  insertLog.run(adminUserId, 'ADM-001', 'ADMIN', 'AUDIT_REVIEW', 'Admin inspected doctor-patient access controls and compliance logs.', '2026-10-05 14:00:00');

  console.log('--- Seed Completed Successfully! ---');
  console.log('Seeded Users: 1 Admin, 4 Doctors, 4 Patients');
  console.log('Seeded Doctor-Patient Assignments: DOC-001 (PAT-1, PAT-2), DOC-002 (PAT-1, PAT-3), DOC-003 (PAT-2, PAT-4), DOC-004 (PAT-3, PAT-4)');
  console.log('Seeded Medical Records, Diagnostics, Prescriptions, Follow-ups, and Activity Logs.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
