import React, { useState, useEffect, useCallback } from 'react';
import { getStudentsAPI, getAttendanceAPI, markAttendanceBulkAPI } from '../api';
import './AttendancePage.css';

export default function AttendancePage() {
  const today = new Date().toISOString().slice(0, 10);

  const [students,   setStudents]   = useState([]);
  const [records,    setRecords]    = useState({});   // { studentId: 'Present'|'Absent' }
  const [history,    setHistory]    = useState([]);
  const [date,       setDate]       = useState(today);
  const [viewDate,   setViewDate]   = useState(today);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [tab,        setTab]        = useState('mark'); // 'mark' | 'history'

  const fetchStudents = useCallback(async () => {
    const list = await getStudentsAPI();
    setStudents(list);
    const init = {};
    list.forEach(s => { init[s.id] = 'Present'; });
    setRecords(init);
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttendanceAPI({ date: viewDate });
      setHistory(data);
    } finally { setLoading(false); }
  }, [viewDate]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { if (tab === 'history') fetchHistory(); else setLoading(false); }, [tab, fetchHistory]);

  const toggle = (id) =>
    setRecords(r => ({ ...r, [id]: r[id] === 'Present' ? 'Absent' : 'Present' }));

  const markAll = (status) => {
    const upd = {};
    students.forEach(s => { upd[s.id] = status; });
    setRecords(upd);
  };

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const recs = students.map(s => ({ student_id: s.id, status: records[s.id] || 'Present' }));
      await markAttendanceBulkAPI(date, recs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Failed to save attendance.'); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const absentCount  = students.length - presentCount;

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Attendance Management</h2>
        <p>Mark and track daily student attendance</p>
      </div>

      {/* Tabs */}
      <div className="att-tabs">
        <button className={`att-tab ${tab==='mark'?'att-tab--active':''}`} onClick={() => setTab('mark')}>
          ✏️ Mark Attendance
        </button>
        <button className={`att-tab ${tab==='history'?'att-tab--active':''}`} onClick={() => setTab('history')}>
          📋 View History
        </button>
      </div>

      {tab === 'mark' && (
        <div className="card">
          {/* Controls */}
          <div className="att-controls">
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date}
                onChange={e => setDate(e.target.value)} style={{width:'auto'}} />
            </div>
            <div className="att-quick-btns">
              <button className="btn btn-ghost" onClick={() => markAll('Present')}>✅ All Present</button>
              <button className="btn btn-ghost" onClick={() => markAll('Absent')}>❌ All Absent</button>
            </div>
          </div>

          {/* Summary pills */}
          <div className="att-summary">
            <div className="att-pill att-pill--green">✅ Present: {presentCount}</div>
            <div className="att-pill att-pill--red">❌ Absent: {absentCount}</div>
            <div className="att-pill att-pill--blue">👥 Total: {students.length}</div>
          </div>

          {/* Student list */}
          <div className="att-list">
            {students.map(s => {
              const isPresent = records[s.id] !== 'Absent';
              return (
                <div
                  key={s.id}
                  className={`att-row ${isPresent ? 'att-row--present' : 'att-row--absent'}`}
                  onClick={() => toggle(s.id)}
                >
                  <div className="att-row-left">
                    <div className={`att-status-dot ${isPresent ? 'dot-green' : 'dot-red'}`} />
                    <div className="att-student-info">
                      <div className="att-student-name">{s.name}</div>
                      <div className="att-student-class">{s.class} · {s.email}</div>
                    </div>
                  </div>
                  <div className={`att-badge ${isPresent ? 'badge-green' : 'badge-red'}`}>
                    {isPresent ? '✅ Present' : '❌ Absent'}
                  </div>
                </div>
              );
            })}
          </div>

          {saved && <div className="alert alert-success">✅ Attendance saved successfully!</div>}

          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{marginTop:16}}>
            {saving ? <span className="spinner" /> : '💾 Save Attendance'}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="att-controls">
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">View Date</label>
              <input className="form-input" type="date" value={viewDate}
                onChange={e => setViewDate(e.target.value)} style={{width:'auto'}} />
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">📅</div>
              <p>No attendance records for {viewDate}</p>
            </div>
          ) : (
            <div className="table-wrap" style={{marginTop:16}}>
              <table>
                <thead>
                  <tr><th>Student</th><th>Class</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {history.map(r => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td><span className="badge badge-blue">{r.class}</span></td>
                      <td style={{color:'var(--slate)'}}>{r.date}</td>
                      <td>
                        <span className={`badge ${r.status==='Present'?'badge-green':'badge-red'}`}>
                          {r.status==='Present'?'✅':'❌'} {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
