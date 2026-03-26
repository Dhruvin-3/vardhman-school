import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getResultsAPI } from '../api';
import './StudentResults.css';

const EXAM_TYPES = ['Half Yearly', 'Unit Test', 'Annual', 'Practical'];

function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', color: '#15803d', bg: '#dcfce7' };
  if (pct >= 80) return { grade: 'A',  color: '#16a34a', bg: '#f0fdf4' };
  if (pct >= 70) return { grade: 'B+', color: '#0284c7', bg: '#e0f2fe' };
  if (pct >= 60) return { grade: 'B',  color: '#2563eb', bg: '#dbeafe' };
  if (pct >= 50) return { grade: 'C',  color: '#d97706', bg: '#fef9c3' };
  return           { grade: 'F',  color: '#dc2626', bg: '#fee2e2' };
}

export default function StudentResults() {
  const { user }                    = useAuth();
  const [allResults, setAllResults] = useState([]);
  const [examType,   setExamType]   = useState('Half Yearly');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getResultsAPI({ student_id: user.id });
        setAllResults(data);
      } finally { setLoading(false); }
    }
    load();
  }, [user.id]);

  const results  = allResults.filter(r => r.exam_type === examType);
  const total    = results.reduce((a, r) => a + r.marks, 0);
  const maxTotal = results.reduce((a, r) => a + r.max_marks, 0);
  const overall  = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
  const { grade: overallGrade, color: overallColor } = getGrade(overall);

  const availableExams = [...new Set(allResults.map(r => r.exam_type))];

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>My Results 📝</h2>
        <p>View your subject-wise marks and grades</p>
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
      ) : allResults.length === 0 ? (
        <div className="card">
          <div className="empty-state"><div className="es-icon">📝</div><p>No results published yet.</p></div>
        </div>
      ) : (
        <>
          {/* Exam type selector */}
          <div className="sr-exam-tabs">
            {(availableExams.length ? availableExams : EXAM_TYPES).map(et => (
              <button key={et}
                className={`sr-exam-tab ${examType === et ? 'sr-exam-tab--active' : ''}`}
                onClick={() => setExamType(et)}>
                {et}
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <div className="card">
              <div className="empty-state"><div className="es-icon">📋</div><p>No results for {examType} yet.</p></div>
            </div>
          ) : (
            <>
              {/* Overall scorecard */}
              <div className="sr-scorecard">
                <div className="sr-scorecard-left">
                  <div className="sr-scorecard-name">{user.name}</div>
                  <div className="sr-scorecard-meta">Class {user.class} · {examType}</div>
                  <div className="sr-scorecard-score">
                    {total} / {maxTotal} <span style={{ fontSize: 16, color: 'var(--slate)' }}>marks</span>
                  </div>
                </div>
                <div className="sr-scorecard-right">
                  <div className="sr-grade-circle" style={{ borderColor: overallColor }}>
                    <div className="sr-grade-val" style={{ color: overallColor }}>{overallGrade}</div>
                    <div className="sr-grade-pct">{overall}%</div>
                  </div>
                  <div className="sr-grade-label">Overall Grade</div>
                </div>
              </div>

              {/* Subject cards */}
              <div className="sr-subject-grid">
                {results.map((r, i) => {
                  const pct = Math.round((r.marks / r.max_marks) * 100);
                  const { grade, color, bg } = getGrade(pct);
                  return (
                    <div className="sr-subject-card" key={r.id}
                      style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="sr-sub-header">
                        <div className="sr-sub-name">{r.subject}</div>
                        <div className="sr-sub-grade" style={{ color, background: bg }}>{grade}</div>
                      </div>
                      <div className="sr-sub-marks">
                        <span className="sr-marks-val">{r.marks}</span>
                        <span className="sr-marks-max">/ {r.max_marks}</span>
                      </div>
                      <div className="sr-bar-track">
                        <div className="sr-bar-fill"
                          style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="sr-sub-pct" style={{ color }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
