import React from 'react';
import './StatCard.css';

export default function StatCard({ icon, value, label, accent }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent || 'var(--gold)' }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
