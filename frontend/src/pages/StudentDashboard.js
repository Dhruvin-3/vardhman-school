import React from 'react';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const details = [
    { key: 'Full Name',       val: user.name,                                   icon: '👤' },
    { key: 'Email Address',   val: user.email,                                  icon: '📧' },
    { key: 'Class / Section', val: user.class,                                  icon: '📚' },
    { key: 'Student ID',      val: `VRM-${String(user.id).padStart(4, '0')}`,   icon: '🪪' },
    { key: 'Academic Year',   val: '2025 – 2026',                               icon: '📅' },
    { key: 'School',          val: 'Vardhman School',                           icon: '🏛️' },
  ];

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-header">
        <h2>Student Dashboard</h2>
        <p>Welcome back, {user.name.split(' ')[0]}! Here's your profile.</p>
      </div>

      <div className="profile-card">
        {/* Header strip */}
        <div className="profile-header">
          <div className="profile-avatar">{initials(user.name)}</div>
          <div className="profile-info">
            <div className="profile-name">{user.name}</div>
            <div className="profile-role">Student · Vardhman School</div>
            <span className="badge badge-green" style={{ marginTop: 8 }}>✅ Active</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="profile-body">
          <div className="card-title">📋 My Details</div>
          <div className="detail-grid">
            {details.map(d => (
              <div className="detail-item" key={d.key}>
                <div className="detail-key">{d.icon} {d.key}</div>
                <div className="detail-val">{d.val}</div>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ marginTop: 24 }}>
            ℹ️ Contact your class admin to update any personal details.
          </div>
        </div>
      </div>
    </div>
  );
}
