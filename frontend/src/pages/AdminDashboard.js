import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentsAPI, addStudentAPI, deleteStudentAPI } from '../api';
import './AdminDashboard.css';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const EMPTY_FORM = { name: '', email: '', class_name: '', password: '' };

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [adding,      setAdding]      = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [formError,   setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try { setStudents(await getStudentsAPI()); }
    catch { setStudents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFormError(''); setFormSuccess('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { name, email, class_name, password } = form;
    if (!name || !email || !class_name || !password) {
      setFormError('All fields are required.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email.'); return;
    }
    setAdding(true); setFormError(''); setFormSuccess('');
    try {
      await addStudentAPI(form);
      setFormSuccess('Student added successfully!');
      setForm(EMPTY_FORM);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add student.');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"?`)) return;
    setDeletingId(id);
    try { await deleteStudentAPI(id); fetchStudents(); }
    catch { alert('Failed to delete.'); }
    finally { setDeletingId(null); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueClasses = new Set(students.map(s => s.class)).size;

  const quickLinks = [
    { icon: '📅', label: 'Mark Attendance',    sub: 'Record daily attendance',    path: '/admin/attendance', color: '#0284c7' },
    { icon: '📝', label: 'Manage Results',      sub: 'Enter subject-wise marks',   path: '/admin/results',    color: '#16a34a' },
    { icon: '📢', label: 'Post Notice',         sub: 'Announce to all students',   path: '/admin/notices',    color: '#d97706' },
    { icon: '💰', label: 'Fee Management',      sub: 'Track payments & dues',      path: '/admin/fees',       color: '#7c3aed' },
  ];

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Welcome back! Here's a quick overview of Vardhman School.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#4ade80' }}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>🏫</div>
          <div>
            <div className="stat-value">{uniqueClasses}</div>
            <div className="stat-label">Classes</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#60a5fa' }}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>📅</div>
          <div>
            <div className="stat-value">{new Date().getFullYear()}</div>
            <div className="stat-label">Academic Year</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="quick-links-grid">
        {quickLinks.map(q => (
          <button key={q.path} className="quick-link-card" onClick={() => navigate(q.path)}>
            <div className="ql-icon" style={{ color: q.color }}>{q.icon}</div>
            <div className="ql-label">{q.label}</div>
            <div className="ql-sub">{q.sub}</div>
            <div className="ql-arrow" style={{ color: q.color }}>→</div>
          </button>
        ))}
      </div>

      {/* Add Student */}
      <div className="card">
        <div className="card-title">➕ Add New Student</div>
        <form onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="e.g. Riya Patel"
                value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="e.g. riya@vardhman.edu"
                value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Class / Section</label>
              <input className="form-input" name="class_name" placeholder="e.g. 10-A"
                value={form.class_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Login Password</label>
              <input className="form-input" name="password" type="password" placeholder="Set student password"
                value={form.password} onChange={handleChange} />
            </div>
          </div>
          {formError   && <div className="alert alert-error">⚠️ {formError}</div>}
          {formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}
          <button className="btn btn-gold add-btn" type="submit" disabled={adding}>
            {adding ? <span className="spinner spinner-dark" /> : '➕ Add Student'}
          </button>
        </form>
      </div>

      {/* Student List */}
      <div className="card">
        <div className="card-title">📋 Student List</div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by name, email or class…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner spinner-dark" /> Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">{searchQuery ? '🔍' : '👨‍🎓'}</div>
            <p>{searchQuery ? 'No students match your search.' : 'No students yet. Add one above!'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Class</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="td-serial">{i + 1}</td>
                    <td>
                      <div className="td-name">
                        <div className="avatar">{initials(s.name)}</div>
                        <span className="student-name">{s.name}</span>
                      </div>
                    </td>
                    <td className="td-email">{s.email}</td>
                    <td><span className="badge badge-blue">{s.class}</span></td>
                    <td>
                      <button className="btn btn-danger"
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deletingId === s.id}>
                        {deletingId === s.id ? '…' : '🗑 Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
