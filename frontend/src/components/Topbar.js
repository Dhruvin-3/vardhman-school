import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">🎓</div>
        <div>
          <div className="topbar-title">Vardhman School</div>
          <div className="topbar-sub">Management System</div>
        </div>
      </div>

      {user && (
        <div className="topbar-right">
          <span className="topbar-badge">
            {user.role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}
          </span>
          <span className="topbar-name">{user.name}</span>
          <button className="topbar-logout" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
