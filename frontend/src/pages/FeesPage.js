import React, { useState, useEffect, useCallback } from 'react';
import { getStudentsAPI, getFeesAPI, addFeeAPI, updateFeeAPI, deleteFeeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './FeesPage.css';

const EMPTY = { student_id:'', amount:'', due_date:'', description:'Tuition Fee' };

export default function FeesPage() {
  const { user }                   = useAuth();
  const isAdmin                    = user?.role === 'admin';

  const [students, setStudents]    = useState([]);
  const [fees,     setFees]        = useState([]);
  const [form,     setForm]        = useState(EMPTY);
  const [loading,  setLoading]     = useState(true);
  const [saving,   setSaving]      = useState(false);
  const [msg,      setMsg]         = useState({ type:'', text:'' });
  const [filterSid,setFilterSid]   = useState(isAdmin ? '' : String(user?.id || ''));
  const [filterSt, setFilterSt]    = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = isAdmin ? {} : { student_id: user.id };
      const [s, f] = await Promise.all([
        isAdmin ? getStudentsAPI() : Promise.resolve([]),
        getFeesAPI(params),
      ]);
      setStudents(s);
      setFees(f);
    } finally { setLoading(false); }
  }, [isAdmin, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.student_id || !form.amount || !form.due_date) {
      setMsg({ type:'error', text:'All fields are required.' }); return;
    }
    setSaving(true);
    try {
      await addFeeAPI({ ...form, student_id: Number(form.student_id), amount: Number(form.amount) });
      setMsg({ type:'success', text:'Fee record added!' });
      setForm(EMPTY);
      fetchAll();
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.detail || 'Failed.' });
    } finally { setSaving(false); }
  };

  const markPaid = async (id) => {
    const today = new Date().toISOString().slice(0,10);
    await updateFeeAPI(id, { status:'Paid', paid_date: today });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee record?')) return;
    await deleteFeeAPI(id);
    fetchAll();
  };

  const filtered = fees.filter(f =>
    (!filterSid || String(f.student_id) === filterSid) &&
    (!filterSt  || f.status === filterSt)
  );

  const totalDue  = filtered.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0);
  const totalPaid = filtered.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Fee Management 💰</h2>
        <p>{isAdmin ? 'Manage student fee records and payments' : 'View your fee status and payment history'}</p>
      </div>

      {/* Summary cards */}
      <div className="fee-summary-row">
        <div className="fee-summary-card fee-summary-card--green">
          <div className="fee-sum-icon">✅</div>
          <div>
            <div className="fee-sum-val">₹{totalPaid.toLocaleString()}</div>
            <div className="fee-sum-label">Total Collected</div>
          </div>
        </div>
        <div className="fee-summary-card fee-summary-card--red">
          <div className="fee-sum-icon">⏳</div>
          <div>
            <div className="fee-sum-val">₹{totalDue.toLocaleString()}</div>
            <div className="fee-sum-label">Total Pending</div>
          </div>
        </div>
        <div className="fee-summary-card fee-summary-card--blue">
          <div className="fee-sum-icon">📋</div>
          <div>
            <div className="fee-sum-val">{filtered.length}</div>
            <div className="fee-sum-label">Total Records</div>
          </div>
        </div>
      </div>

      {/* Add fee — admin only */}
      {isAdmin && (
        <div className="card">
          <div className="card-title">➕ Add Fee Record</div>
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-input" name="student_id" value={form.student_id}
                  onChange={e => setForm(f => ({...f, student_id: e.target.value}))}>
                  <option value="">— Select Student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 5000"
                  value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date"
                  value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. Q3 Tuition Fee"
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
            </div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <button className="btn btn-gold" type="submit" disabled={saving} style={{marginTop:12}}>
              {saving ? <span className="spinner spinner-dark" /> : '➕ Add Fee'}
            </button>
          </form>
        </div>
      )}

      {/* Fees table */}
      <div className="card">
        <div className="card-title">📋 Fee Records</div>

        {isAdmin && (
          <div className="fee-filters">
            <select className="form-input" value={filterSid} onChange={e => setFilterSid(e.target.value)} style={{width:'auto'}}>
              <option value="">All Students</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="form-input" value={filterSt} onChange={e => setFilterSt(e.target.value)} style={{width:'auto'}}>
              <option value="">All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="es-icon">💰</div><p>No fee records found.</p></div>
        ) : (
          <div className="table-wrap" style={{marginTop:16}}>
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Student</th>}
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    {isAdmin && <td><strong>{f.name}</strong><br/><span style={{fontSize:12,color:'var(--slate)'}}>{f.class}</span></td>}
                    <td>{f.description}</td>
                    <td><strong>₹{f.amount.toLocaleString()}</strong></td>
                    <td style={{color:'var(--slate)'}}>{f.due_date}</td>
                    <td style={{color:'var(--slate)'}}>{f.paid_date || '—'}</td>
                    <td>
                      <span className={`badge ${f.status==='Paid' ? 'badge-green' : 'badge-red'}`}>
                        {f.status==='Paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          {f.status === 'Pending' && (
                            <button className="btn btn-ghost" style={{fontSize:12,padding:'5px 10px'}}
                              onClick={() => markPaid(f.id)}>✅ Mark Paid</button>
                          )}
                          <button className="btn btn-danger" style={{fontSize:12,padding:'5px 10px'}}
                            onClick={() => handleDelete(f.id)}>🗑</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
