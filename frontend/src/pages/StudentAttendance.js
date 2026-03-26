import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendanceAPI, getAttendanceSummaryAPI } from '../api';
import './StudentAttendance.css';

export default function StudentAttendance() {
  const { user }                  = useAuth();
  const [records, setRecords]     = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [recs, sum] = await Promise.all([
          getAttendanceAPI({ student_id: user.id }),
          getAttendanceSummaryAPI(user.id),
        ]);
        setRecords(recs);
        setSummary(sum);
      } finally { setLoading(false); }
    }
    load();
  }, [user.id]);

  const pct = summary?.percentage || 0;
  const pctColor = pct >= 75 ? 'var(--green)' : pct >= 60 ? '#d97706' : 'var(--red)';

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>My Attendance 📅</h2>
        <p>Track your daily attendance records</p>
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
      ) : (
        <>
          {/* Summary */}
          {summary && (
            <div className="card sa-summary">
              <div className="sa-circle" style={{background:`conic-gradient(${pctColor} ${pct*3.6}deg, #e2e8f0 0)`}}>
                <div className="sa-circle-inner">
                  <span className="sa-pct">{pct}%</span>
                  <span className="sa-pct-label">Attendance</span>
                </div>
              </div>
              <div className="sa-stats">
                <div className="sa-stat"><span className="sa-stat-val sa-green">{summary.present}</span><span className="sa-stat-key">Days Present</span></div>
                <div className="sa-stat"><span className="sa-stat-val sa-red">{summary.absent}</span><span className="sa-stat-key">Days Absent</span></div>
                <div className="sa-stat"><span className="sa-stat-val">{summary.total}</span><span className="sa-stat-key">Total Days</span></div>
              </div>
              <div className={`sa-status-msg ${pct>=75?'sa-good':'sa-warn'}`}>
                {pct >= 75
                  ? '✅ Your attendance is satisfactory. Keep it up!'
                  : '⚠️ Your attendance is below 75%. Please improve.'}
              </div>
            </div>
          )}

          {/* Record table */}
          <div className="card">
            <div className="card-title">📋 Attendance Log</div>
            {records.length === 0 ? (
              <div className="empty-state"><div className="es-icon">📅</div><p>No attendance records yet.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{color:'var(--slate-lt)',fontSize:12}}>{i+1}</td>
                        <td>{r.date}</td>
                        <td><span className={`badge ${r.status==='Present'?'badge-green':'badge-red'}`}>
                          {r.status==='Present'?'✅':'❌'} {r.status}
                        </span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
