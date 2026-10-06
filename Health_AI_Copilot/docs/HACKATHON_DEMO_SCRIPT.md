# Hackathon Presentation Demo Script

Follow this sequence for the 24-hour hackathon pitch:

### Phase 1: Problem & Landing Page
1. Open `http://localhost:5173/` (Landing Page).
2. Point out:
   - "One secure health profile for every patient, powered by OCR and AI."
   - The scattered records problem and the clinical solution.
   - Quick 1-click role switcher showing Admin, 4 Doctors, and 4 Patients.

### Phase 2: Doctor Workflow (Upload & Verification)
3. Click **Dr. Arun Kumar (DOC-001)**.
4. View Doctor Dashboard:
   - See assigned patients: **PAT-1001** and **PAT-1002** (Notice strict RBAC: PAT-1003/1004 are not accessible).
5. Select **Demo Patient 1 (PAT-1001)**:
   - View demographics, ABHA ID (`91-8273-1940-5812`), and existing chronological timeline.
6. Click **"Upload Medical Report"**:
   - Select Document Category: **Lab Report** (Comprehensive Blood Panel).
   - Click **"Process Document with OCR"**.
7. Watch the 6-stage visual pipeline:
   - *Uploading document...*
   - *OCR Processing...*
   - *Extracting medical fields...*
   - *Validating clinical ranges...*
   - *Waiting for doctor verification...*
8. In the Doctor Verification table:
   - Show extracted tests (Hemoglobin 13.2 g/dL, Glucose 142 mg/dL, HbA1c 6.8%).
   - Point out: **Glucose and HbA1c are flagged as "Flagged for professional review"**.
   - Show that values can be adjusted if needed by the clinician.
9. Click **"Verify and Save Record"**.
10. Watch it save to timeline, update the AI Health Summary, and log activity.
11. Click **Sign Out**.

### Phase 3: Patient Workflow (AI Copilot, Tamil & Compare)
12. Click **Patient 1 (PAT-1001)**.
13. Patient automatically sees their updated **AI Health Summary** at top of screen.
14. Switch Language to **தமிழ் (Tamil)**:
    - AI Summary immediately switches to readable Tamil medical explanation:
      *"உங்கள் சமீபத்திய ரத்தப் பரிசோதனையில் Glucose (142 mg/dL) மற்றும் HbA1c (6.8%) அளவுகள் கொடுக்கப்பட்ட reference range-ஐ விட அதிகமாக உள்ளன..."*
15. View **"Next Follow-up"** card:
    - Reminding patient of consultation on **20 October 2026** with Dr. Arun Kumar.
16. Open **"Compare Reports"** tab:
    - Compare January 2026 Baseline vs October 2026 Follow-up.
    - Show Glucose increase (+37 mg/dL) and stable Hemoglobin (-0.3 g/dL) with clear trend arrows.
17. Open **"Ask AI Health Copilot"** Chatbot:
    - Click chip: *"Explain my latest report in simple language"*.
    - Click chip: *"Which values are outside the reference range?"*.
    - Ask: *"Explain this in Tamil"*.
    - Test safety guardrail: Ask *"Should I stop taking my medicine?"* → Watch AI safely intercept and advise against altering medications without a doctor.
18. Click **Sign Out**.

### Phase 4: Hospital Administrator Oversight
19. Click **Hospital Admin (ADM-001)**.
20. View executive statistics:
    - 4 Active Doctors, 4 Patients, Total Records, Flagged Observations count.
21. View **RBAC Authorization Matrix**:
    - Complete cross-table of which doctors are assigned to which patients.
22. View **Audit Log**:
    - Verifying all uploads, doctor sign-offs, and patient logins are cryptographically tracked.
