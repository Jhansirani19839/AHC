/**
 * API Service Client
 * Centralized fetch wrapper communicating with backend endpoints.
 */

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('health_copilot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const api = {
  // Authentication
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Patients
  async getPatients() {
    const res = await fetch(`${API_BASE}/patients`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getPatientById(id) {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getPatientRecords(id) {
    const res = await fetch(`${API_BASE}/patients/${id}/records`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Medical Records & OCR
  async processOcr(formData) {
    const res = await fetch(`${API_BASE}/ocr/process`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  },

  async saveRecord(recordData) {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(recordData)
    });
    return handleResponse(res);
  },

  async getRecordById(id) {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // AI Services
  async getAiSummary(params) {
    const res = await fetch(`${API_BASE}/ai/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  async chatWithAi(message, patientId = null, language = 'en') {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ message, patient_id: patientId, language })
    });
    return handleResponse(res);
  },

  async compareReports(payload) {
    const res = await fetch(`${API_BASE}/ai/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Follow-ups
  async getFollowUps(patientId = null) {
    const url = patientId ? `${API_BASE}/followups?patient_id=${patientId}` : `${API_BASE}/followups`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createFollowUp(data) {
    const res = await fetch(`${API_BASE}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminActivity() {
    const res = await fetch(`${API_BASE}/admin/activity`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminMatrix() {
    const res = await fetch(`${API_BASE}/admin/matrix`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async assignDoctorPatient(doctorId, patientId) {
    const res = await fetch(`${API_BASE}/admin/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ doctor_id: doctorId, patient_id: patientId })
    });
    return handleResponse(res);
  }
};
