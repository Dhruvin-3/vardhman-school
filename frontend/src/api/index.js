import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────
export const loginAPI = (email, password, role) =>
  api.post('/login', { email, password, role }).then(r => r.data);

// ── Students ──────────────────────────────────────────
export const getStudentsAPI = () =>
  api.get('/students').then(r => r.data);

export const addStudentAPI = (payload) =>
  api.post('/students', payload).then(r => r.data);

export const deleteStudentAPI = (id) =>
  api.delete(`/students/${id}`).then(r => r.data);

// ── Attendance ────────────────────────────────────────
export const getAttendanceAPI = (params = {}) =>
  api.get('/attendance', { params }).then(r => r.data);

export const markAttendanceBulkAPI = (date, records) =>
  api.post('/attendance/bulk', { date, records }).then(r => r.data);

export const getAttendanceSummaryAPI = (studentId) =>
  api.get(`/attendance/summary/${studentId}`).then(r => r.data);

// ── Results ───────────────────────────────────────────
export const getResultsAPI = (params = {}) =>
  api.get('/results', { params }).then(r => r.data);

export const addResultAPI = (payload) =>
  api.post('/results', payload).then(r => r.data);

export const deleteResultAPI = (id) =>
  api.delete(`/results/${id}`).then(r => r.data);

// ── Notices ───────────────────────────────────────────
export const getNoticesAPI = () =>
  api.get('/notices').then(r => r.data);

export const addNoticeAPI = (payload) =>
  api.post('/notices', payload).then(r => r.data);

export const deleteNoticeAPI = (id) =>
  api.delete(`/notices/${id}`).then(r => r.data);

// ── Fees ──────────────────────────────────────────────
export const getFeesAPI = (params = {}) =>
  api.get('/fees', { params }).then(r => r.data);

export const addFeeAPI = (payload) =>
  api.post('/fees', payload).then(r => r.data);

export const updateFeeAPI = (id, payload) =>
  api.patch(`/fees/${id}`, payload).then(r => r.data);

export const deleteFeeAPI = (id) =>
  api.delete(`/fees/${id}`).then(r => r.data);

export default api;
