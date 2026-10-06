# AI Health Copilot

> **“One secure health profile for every patient, powered by OCR and AI.”**  
> 24-Hour Hackathon Prototype for the Challenge: *“AI-Powered Personal Health Copilot”*  
> Clinical Facility: **Paavai Demo Hospital**

---

## 1. Problem Statement
Medical records are scattered across prescriptions, laboratory reports, discharge summaries, and diagnostic tests.
- **For Patients:** Technical clinical jargon, inconsistent test units, and fragmented histories make personal health records difficult to comprehend.
- **For Healthcare Professionals:** Doctors spend disproportionate amounts of consultation time piecing together documents across disparate sources rather than focusing on patient care.

---

## 2. Solution
**AI Health Copilot** is a secure hospital-based web platform that converts scattered medical documents into a unified, secure, and plain-language patient health profile through a doctor-verified OCR and safe clinical AI pipeline.

### Core Pillars:
1. **Document-to-Timeline Pipeline:** Upload documents (lab reports, prescriptions, discharge summaries, diagnostics) → OCR extraction → Reference range validation → **Mandatory Doctor Verification** → Chronological Timeline integration.
2. **Context-Restricted AI Copilot:** Patient health inquiries answered strictly from the patient’s verified records in simple **English** and **Tamil (தமிழ்)**.
3. **Safe Medical AI Guardrails:** Zero autonomous diagnosis, zero prescription alteration, and consistent medical disclaimers.
4. **Role-Based Access Control (RBAC):** Strict data segregation across Admin, Doctors (assigned patients only), and Patients (self only).
5. **ABDM & FHIR Architecture:** Internal Patient IDs as primary keys, with future-ready mapping for Ayushman Bharat Digital Mission (ABHA IDs) and HL7 FHIR resource representations (`Observation`, `MedicationRequest`, `DiagnosticReport`, `Encounter`).

---

## 3. Technology Stack

- **Frontend:**
  - React 18
  - Vite 6
  - Lucide React (Clinical SaaS Iconography)
  - Custom Healthcare UI CSS (Responsive, Clean White & Healthcare Blue)
- **Backend:**
  - Node.js (v20+ / v24)
  - Express.js
  - SQLite with `better-sqlite3` (Zero external database server required)
  - JSON Web Tokens (JWT) & Bcrypt password hashing
  - Multer for medical document uploads
- **AI & OCR Engines:**
  - Modular native AI layer (`ai/summaries`, `ai/chatbot`, `ai/comparison`, `ai/safety`)
  - Modular OCR pipeline (`ocr/document-processing`, `ocr/extraction`, `ocr/validation`)
  - Safe deterministic mock AI engine (100% operational offline without external API keys or paid subscriptions)

---

## 4. Folder Structure

```
ai-health-copilot/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components (Navbar, Timeline, Chatbot, UploadModal, etc.)
│       ├── pages/             # LandingPage, LoginPage
│       ├── layouts/           # Page layouts and containers
│       ├── dashboards/        # Role-based dashboards (Admin, Doctor, Patient)
│       ├── services/          # API client wrapper
│       ├── hooks/             # Custom React hooks
│       ├── context/           # AuthContext, LanguageContext
│       ├── utils/             # Formatters and helpers
│       └── assets/            # Static assets
│
├── backend/
│   ├── controllers/           # Auth, Patient, Record, OCR, AI, Followup, Admin controllers
│   ├── routes/                # Express API route modules
│   ├── models/                # Schema definitions & database helpers
│   ├── middleware/            # Auth JWT, RBAC authorization, Multer file upload
│   ├── services/              # Business logic wrappers
│   ├── utils/                 # Utility helpers
│   └── config/                # Database connection and JWT secrets
│
├── database/
│   ├── schema/                # schema.sql SQLite table definitions
│   ├── migrations/            # Database initialization scripts
│   └── seed/                  # seedData.js with Paavai Demo Hospital datasets
│
├── ai/
│   ├── summaries/             # Bilingual patient profile and record summaries
│   ├── chatbot/               # Context-aware conversational AI copilot
│   ├── comparison/            # Lab report comparative delta analyzer
│   └── safety/                # Clinical safety guardrails and prompt interceptors
│
├── ocr/
│   ├── document-processing/   # File intake and optical text preprocessor
│   ├── extraction/            # Entity and medical field extraction parser
│   └── validation/            # Reference range boundary validator and flagging
│
├── uploads/                   # Document storage directory
├── docs/                      # Architecture and presentation guides
├── scripts/                   # Demo reset and utility scripts
├── tests/                     # Automated test suite
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Demo Credentials

### Hospital Name: **Paavai Demo Hospital**

| Role | User ID | Name | Email | Password | Assigned Scope |
|------|---------|------|-------|----------|----------------|
| **ADMIN** | `ADM-001` | Hospital Admin | `admin@paavaidemo.com` | `Admin@123` | Full Hospital Governance |
| **DOCTOR 1** | `DOC-001` | Dr. Arun Kumar | `arun@paavaidemo.com` | `Doctor@123` | Internal Medicine (`PAT-1001`, `PAT-1002`) |
| **DOCTOR 2** | `DOC-002` | Dr. Priya | `priya@paavaidemo.com` | `Doctor@123` | Cardiology (`PAT-1001`, `PAT-1003`) |
| **DOCTOR 3** | `DOC-003` | Dr. Karthik | `karthik@paavaidemo.com` | `Doctor@123` | Endocrinology (`PAT-1002`, `PAT-1004`) |
| **DOCTOR 4** | `DOC-004` | Dr. Meena | `meena@paavaidemo.com` | `Doctor@123` | Pathology (`PAT-1003`, `PAT-1004`) |
| **PATIENT 1** | `PAT-1001` | Demo Patient 1 | `patient1@paavaidemo.com` | `Patient@123` | Self profile only |
| **PATIENT 2** | `PAT-1002` | Demo Patient 2 | `patient2@paavaidemo.com` | `Patient@123` | Self profile only |
| **PATIENT 3** | `PAT-1003` | Demo Patient 3 | `patient3@paavaidemo.com` | `Patient@123` | Self profile only |
| **PATIENT 4** | `PAT-1004` | Demo Patient 4 | `patient4@paavaidemo.com` | `Patient@123` | Self profile only |

*Note: All patient and provider data are entirely fictional demonstration records.*

---

## 6. Installation & Setup

### Prerequisites
- Node.js (version 18 or newer; tested on Node v24.21.0)
- npm (version 9 or newer; tested on npm 11.19.0)

### 1. Install Dependencies
```bash
# Install root and backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Environment Configuration
The application comes preconfigured. To create a local environment file:
```bash
cp .env.example .env
```
Default parameters in `.env`:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=paavai_demo_health_secret_key_2026
UPLOAD_DIR=uploads
AI_MOCK_MODE=true
```

### 3. Initialize & Seed Database
```bash
npm run seed
```

### 4. Run Automated Test Suite
```bash
npm test
```

---

## 7. Running the Application

### Option A: Run Both Backend & Frontend Simultaneously (Recommended)
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

### Option B: Run in Separate Terminals
**Terminal 1 (Backend Server):**
```bash
npm run server
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
```

---

## 8. 27-Step Hackathon Presentation Flow

1. **Landing Page:** Open `http://localhost:5173`. Show the problem statement, 6-stage architecture, and 1-click role switcher.
2. **Doctor Login:** Click `Dr. Arun Kumar (DOC-001)`.
3. **Doctor Dashboard:** Review assigned patients (`PAT-1001`, `PAT-1002`). Note that `PAT-1003` and `PAT-1004` are excluded due to RBAC.
4. **Search/Select Patient:** Select `Demo Patient 1 (PAT-1001)`.
5. **Patient Profile:** View demographics, ABHA ID (`91-8273-1940-5812`), and existing January 2026 blood test.
6. **Upload Report:** Click **"Upload Medical Report"** and select **Lab Report**.
7. **OCR Processing:** Click **"Process Document with OCR"**.
8. **Watch Visual States:** Step through `Uploading...` → `OCR Processing...` → `Extracting medical fields...` → `Validating...` → `Waiting for doctor verification...`.
9. **Doctor Verification:** Review the extracted table (Hemoglobin 13.2 g/dL, Glucose 142 mg/dL, HbA1c 6.8%).
10. **Flagged Values:** Notice Glucose and HbA1c are flagged with **“Flagged for professional review”** without diagnosing.
11. **Save Record:** Doctor clicks **"Verify and Save Record"**.
12. **Auto AI Summary:** A new simple-language clinical summary is generated automatically.
13. **Timeline Updated:** Record is appended to the patient’s chronological timeline.
14. **Doctor Logout:** Click **Sign Out**.
15. **Patient Login:** Click **Demo Patient 1 (PAT-1001)**.
16. **Patient Dashboard:** The patient automatically sees their updated **AI Health Summary** at the top of the dashboard.
17. **Review Latest Report:** Inspect the newly verified October 2026 lab report in the timeline.
18. **Ask AI Health Copilot:** Open the chatbot and ask: *"Explain my latest report in simple language"*.
19. **Test Value Query:** Ask: *"What does this glucose value mean?"*.
20. **Tamil Language Explanation:** Toggle to **தமிழ்** or ask: *"Explain this report in Tamil"*. Notice natural Tamil output:
    > *“உங்கள் சமீபத்திய ரத்தப் பரிசோதனையில் Glucose (142 mg/dL) மற்றும் HbA1c (6.8%) அளவுகள் கொடுக்கப்பட்ட reference range-ஐ விட அதிகமாக உள்ளன. இதைப் பற்றி மருத்துவரிடம் ஆலோசிக்கவும்.”*
21. **Report Comparison:** Open the **"Compare Reports"** tab. Compare **January 2026 Baseline** vs **October 2026 Follow-up**. Observe numeric delta (`+37 mg/dL Glucose`) with non-diagnostic trend badges.
22. **Follow-up Reminder:** View the prominent reminder card: **Next Follow-up: 20 October 2026** with Dr. Arun Kumar.
23. **Safety Guardrail Test:** Ask the copilot: *"Should I stop taking my medicine?"*. Observe the AI intercept the query and mandate consulting the prescribing doctor.
24. **Patient Logout:** Click **Sign Out**.
25. **Admin Login:** Click **Hospital Admin (ADM-001)**.
26. **Admin Dashboard:** Review executive statistics (4 Doctors, 4 Patients, Total Records, Audit Logs).
27. **Access Governance:** Inspect the **RBAC Authorization Matrix** displaying doctor-patient boundary assignments.

---

## 9. AI Safety & Medical Disclaimer

> [!CAUTION]
> **Clinical AI Guardrail Policy:**  
> AI-generated information is strictly for understanding health records and **does not replace professional medical advice, diagnosis, or treatment**.  
> The system strictly enforces that the AI model does **NOT**:
> 1. Diagnose clinical diseases.
> 2. Prescribe medications or recommend dosage adjustments.
> 3. Advise patients to discontinue medications.
> 4. Replace licensed medical practitioners.
> 5. Make autonomous health claims.
> 
> All outputs include mandatory clinical disclaimers in English and Tamil.

---

## 10. ABDM & FHIR Readiness Architecture

- **Primary Application Identifier:** Internal Patient ID (`patient_code`, e.g., `PAT-1001`).
- **ABDM-Ready Attributes:** Includes schema fields for `abha_id` (14-digit format), `health_id` (ABHA address), and `external_record_id`.
- **FHIR Resource Alignment:**
  - Lab test observations → `Observation`
  - Lab reports → `DiagnosticReport`
  - Prescriptions → `MedicationRequest`
  - Discharge summaries → `Encounter` / `Composition`
- *Disclaimer: Built to mirror ABDM/FHIR architecture for future sandbox integration; not certified in this prototype.*

---

## 11. Hackathon Live Presentation Notes

- **Offline-First:** All dependencies, databases, OCR parsing, and AI synthesis operate locally without external cloud connectivity.
- **Realistic Seed Data:** Patients and doctors are seeded with clinical observations spanning CBC, Fasting Glucose, HbA1c, ECG vitals, and Metformin prescriptions.
- **Fast Role Switching:** The Landing Page features 1-click authentication cards for all 9 demo users so evaluators can inspect every permission role without typing passwords.
