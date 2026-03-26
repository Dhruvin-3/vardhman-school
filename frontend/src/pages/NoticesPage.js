import React, { useState, useEffect, useCallback } from 'react';
import { getNoticesAPI, addNoticeAPI, deleteNoticeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './NoticesPage.css';

export default function NoticesPage() {
  const { user }                    = useAuth();
  const isAdmin                     = user?.role === 'admin';
  const [notices,  setNotices]      = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [form,     setForm]         = useState({ title:'', body:'' });
  const [saving,   setSaving]       = useState(false);
  const [msg,      setMsg]          = useState('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try { setNotices(await getNoticesAPI()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.title || !form.body) { setMsg('error:Fill in title and body.'); return; }
    setSaving(true);
    try {
      await addNoticeAPI(form);
      setMsg('success:Notice posted!');
      setForm({ title:'', body:'' });
      fetchNotices();
    } catch { setMsg('error:Failed to post notice.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await deleteNoticeAPI(id);
    fetchNotices();
  };

  const [msgType, msgText] = msg.split(':');

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Notice Board 📢</h2>
        <p>{isAdmin ? 'Post and manage school announcements' : 'Stay updated with school announcements'}</p>
      </div>

      {/* Add form — admin only */}
      {isAdmin && (
        <div className="card">
          <div className="card-title">📣 Post New Notice</div>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="Notice title…"
                value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input notice-textarea" rows={4}
                placeholder="Write the notice content…"
                value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))} />
            </div>
            {msg && <div className={`alert alert-${msgType}`}>{msgText}</div>}
            <button className="btn btn-gold" type="submit" disabled={saving} style={{marginTop:10}}>
              {saving ? <span className="spinner spinner-dark" /> : '📢 Post Notice'}
            </button>
          </form>
        </div>
      )}

      {/* Notices list */}
      <div className="card">
        <div className="card-title">📋 All Notices</div>
        {loading ? (
          <div className="loading-state"><span className="spinner spinner-dark" /> Loading…</div>
        ) : notices.length === 0 ? (
          <div className="empty-state"><div className="es-icon">📢</div><p>No notices yet.</p></div>
        ) : (
          <div className="notices-list">
            {notices.map((n, i) => (
              <div className="notice-card" key={n.id} style={{animationDelay:`${i*0.06}s`}}>
                <div className="notice-dot" />
                <div className="notice-content">
                  <div className="notice-header">
                    <h3 className="notice-title">{n.title}</h3>
                    <div className="notice-meta">
                      <span className="badge badge-blue">📅 {n.created_at}</span>
                      {isAdmin && (
                        <button className="btn btn-danger notice-del" onClick={() => handleDelete(n.id)}>
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="notice-body">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
