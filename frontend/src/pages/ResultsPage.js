import React, { useState, useEffect, useCallback } from 'react';
import { getStudentsAPI, getResultsAPI, addResultAPI, deleteResultAPI } from '../api';
import './ResultsPage.css';

const SUBJECTS   = ['Mathematics','Science','English','Hindi','Social Studies','Computer Science','Physical Education'];
const EXAM_TYPES = ['Unit Test','Half Yearly','Annual','Practical'];

function getGrade(pct) {
  if (pct >= 90) return { grade:'A+', color:'#15803d' };
  if (pct >= 80) return { grade:'A',  color:'#16a34a' };
  if (pct >= 70) return { grade:'B+', color:'#0284c7' };
  if (pct >= 60) return { grade:'B',  color:'#2563eb' };
  if (pct >= 50) return { grade:'C',  color:'#d97706' };
  return { grade:'F', color:'#dc2626' };
}

const EMPTY = { student_id:'', subject:SUBJECTS[0], marks:'', max_marks:100, exam_type:EXAM_TYPES[1] };

export default function ResultsPage() {
  const [students,  setStudents]  = useState([]);
  const [results,   setResults]   = useState([]);
  const [form,      setForm]      = useState(EMPTY);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [filterSid, setFilterSid] = useState('');
  const [filterEx,  setFilterEx]  = useState('');
  const [msg,       setMsg]       = useState({ type:'', text:'' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([getStudentsAPI(), getResultsAPI()]);
      setStudents(s); setResults(r);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setMsg({ type:'', text:'' });
  };

  const handleAdd = async e => {
    e.preventDefault();
    const { student_id, subject, marks, max_marks, exam_type } = form;
    if (!student_id || !marks) { setMsg({ type:'error', text:'Fill all fields.' }); return; }
    if (Number(marks) > Number(max_marks)) { setMsg({ type:'error', text:'Marks cannot exceed max marks.' }); return; }
    setSaving(true);
    try {
      await addResultAPI({ student_id: Number(student_id), subject, marks: Number(marks), max_marks: Number(max_marks), exam_type });
      setMsg({ type:'success', text:'Result saved!' });
      setForm(EMPTY);
      fetchAll();
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.detail || 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    await deleteResultAPI(id);
    fetchAll();
  };

  const filtered = results.filter(r =>
    (!filterSid || String(r.student_id) === filterSid) &&
    (!filterEx  || r.exam_type === filterEx)
  );

  // Stats
  const totalMarks   = filtered.reduce((a, r) => a + r.marks, 0);
  const totalMax     = filtered.reduce((a, r) => a + r.max_marks, 0);
  const overallPct   = totalMax ? Math.round((totalMarks / totalMax) * 100) : 0;

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Results & Marks</h2>
        <p>Enter subject-wise marks and generate report cards</p>
      </div>

      {/* Add form */}
      <div className="card">
        <div className="card-title">➕ Add / Update Result</div>
        <form onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student</label>
              <select className="form-input" name="student_id" value={form.student_id} onChange={handleChange}>
                <option value="">— Select Student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input" name="subject" value={form.subject} onChange={handleChange}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Marks Obtained</label>
              <input className="form-input" name="marks" type="number" min="0"
                placeholder="e.g. 85" value={form.marks} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input className="form-input" name="max_marks" type="number" min="1"
                value={form.max_marks} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select className="form-input" name="exam_type" value={form.exam_type} onChange={handleChange}>
                {EXAM_TYPES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <button className="btn btn-gold" type="submit" disabled={saving} style={{marginTop:12}}>
            {saving ? <span className="spinner spinner-dark" /> : '💾 Save Result'}
          </button>
        </form>
      </div>

      {/* Results table */}
      <div className="card">
        <div className="card-title">📊 Results Overview</div>

        {/* Filters */}
        <div className="res-filters">
          <select className="form-input" value={filterSid} onChange={e => setFilterSid(e.target.value)} style={{width:'auto'}}>
            <option value="">All Students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="form-input" value={filterEx} onChange={e => setFilterEx(e.target.value)} style={{width:'auto'}}>
            <option value="">All Exams</option>
            {EXAM_TYPES.map(e => <option key={e}>{e}</option>)}
          </select>
          {totalMax > 0 && (
            <div className="res-overall">
              Overall: <strong>{overallPct}%</strong>
              <span className="badge" style={{marginLeft:8, color: getGrade(overallPct).color, background:'#f8fafc'}}>
                {getGrade(overallPct).grade}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="es-icon">📝</div><p>No results found.</p></div>
        ) : (
          <div className="table-wrap" style={{marginTop:16}}>
            <table>
              <thead>
                <tr><th>Student</th><th>Class</th><th>Subject</th><th>Exam</th><th>Marks</th><th>%</th><th>Grade</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const pct = Math.round((r.marks / r.max_marks) * 100);
                  const { grade, color } = getGrade(pct);
                  return (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
                      <td><span className="badge badge-blue">{r.class}</span></td>
                      <td>{r.subject}</td>
                      <td><span className="badge badge-gold">{r.exam_type}</span></td>
                      <td><strong>{r.marks}</strong>/{r.max_marks}</td>
                      <td>
                        <div className="pct-bar-wrap">
                          <div className="pct-bar" style={{width:`${pct}%`, background: color}} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td><span className="grade-badge" style={{color}}>{grade}</span></td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>🗑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
