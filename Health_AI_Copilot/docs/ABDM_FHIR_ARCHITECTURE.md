# ABDM & FHIR Readiness Architecture

## Overview
The **AI Health Copilot** platform at **Paavai Demo Hospital** is architected to align with India's **Ayushman Bharat Digital Mission (ABDM)** ecosystem and international **HL7 FHIR (Fast Healthcare Interoperability Resources)** standards.

> [!NOTE]
> **Prototype Status:** This 24-hour hackathon prototype uses an internal primary identifier (`patient_code`, e.g., `PAT-1001`) and provides schema-ready fields for `abha_id`, `health_id`, and `external_record_id`. It does not claim live certification or active production connection to the National Health Authority (NHA) ABDM sandbox.

---

## 1. Identity Mapping (ABHA / Health ID)
In accordance with ABDM guidelines:
- Every patient in the local registry possesses an internal identifier (`PAT-1001` through `PAT-1004`).
- An optional 14-digit ABHA number (`abha_id`, e.g., `91-8273-1940-5812`) and ABHA Address (`health_id`, e.g., `pat1@abdm`) are modeled.
- In production, consent artifact verification (M2/M3 flow) will bind to these identifiers using cryptographic HIP/HIU callbacks.

---

## 2. FHIR Resource Alignment
Medical records and diagnostics generated via the OCR and doctor verification pipeline map cleanly to standard HL7 FHIR concepts:

| Health Copilot Entity | Equivalent FHIR Resource | Purpose |
|-----------------------|-------------------------|---------|
| **Patient Profile** | `Patient` | Demographics, ABHA identifiers, blood group, contact info |
| **Lab Test Result** | `Observation` | Numerical findings (e.g. Glucose 142 mg/dL), reference ranges, flag status |
| **Lab / Diagnostic Report** | `DiagnosticReport` | Grouped panel observations (e.g. CBC, Lipid Profile, ECG) with doctor sign-off |
| **Prescription Item** | `MedicationRequest` | Drug name, dosage, frequency, duration, instructions |
| **Discharge Summary** | `Encounter` / `Composition` | Inpatient hospital stay summaries, admission/discharge dates |

---

## 3. Future Interoperability Roadmap
1. **HIP (Health Information Provider):** Expose FHIR bundle endpoints for health record discovery upon patient consent.
2. **HIU (Health Information User):** Ingest external health records shared from other ABDM-compliant health facilities.
3. **SNOMED CT & LOINC:** Normalize test names (LOINC 1558-6 for Fasting Glucose) during the OCR extraction stage.
