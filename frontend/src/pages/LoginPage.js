import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginAPI } from '../api';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [role,     setRole]     = useState('admin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const hints = {
    admin:   { email: 'admin@vardhman.edu',  password: 'admin123'   },
    student: { email: 'aarav@vardhman.edu', password: 'student123' },
  };

  const handleRoleChange = (r) => {
    setRole(r);
    setEmail('');
    setPassword('');
    setError('');
  };

  const autoFill = () => {
    setEmail(hints[role].email);
    setPassword(hints[role].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await loginAPI(email, password, role);
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-circle login-bg-circle--1" />
      <div className="login-bg-circle login-bg-circle--2" />

      <div className="login-card animate-fadeUp">
        {/* Emblem */}
        <div className="login-emblem">
          <div className="login-emblem-icon">🏛️</div>
          <h1>Vardhman School</h1>
          <p>Management System</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {['admin', 'student'].map((r) => (
            <button
              key={r}
              className={`role-tab ${role === r ? 'role-tab--active' : ''}`}
              onClick={() => handleRoleChange(r)}
              type="button"
            >
              {r === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In →'}
          </button>
        </form>

        {/* Hint Box */}
        <div className="hint-box">
          <strong>🔑 Demo Credentials</strong>
          {role === 'admin'
            ? 'admin@vardhman.edu / admin123'
            : 'aarav@vardhman.edu / student123'}
          <br />
          <span className="hint-autofill" onClick={autoFill}>
            ↗ Click to auto-fill
          </span>
        </div>
      </div>
    </div>
  );
}
