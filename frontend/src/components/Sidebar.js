import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const ADMIN_LINKS = [
  { to: '/admin',        icon: '📊', label: 'Dashboard'  },
  { to: '/admin/attendance', icon: '📅', label: 'Attendance' },
  { to: '/admin/results',    icon: '📝', label: 'Results'    },
  { to: '/admin/notices',    icon: '📢', label: 'Notices'    },
  { to: '/admin/fees',       icon: '💰', label: 'Fees'       },
];

const STUDENT_LINKS = [
  { to: '/student',             icon: '👤', label: 'My Profile'  },
  { to: '/student/attendance',  icon: '📅', label: 'Attendance'  },
  { to: '/student/results',     icon: '📝', label: 'My Results'  },
  { to: '/student/notices',     icon: '📢', label: 'Notices'     },
  { to: '/student/fees',        icon: '💰', label: 'My Fees'     },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">🎓</div>
        <div>
          <div className="sidebar-title">Vardhman</div>
          <div className="sidebar-sub">School System</div>
        </div>
      </div>

      {/* User pill */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">
            {user?.role === 'admin' ? '👨‍💼 Administrator' : `👨‍🎓 ${user?.class || 'Student'}`}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/student'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        🚪 Sign Out
      </button>
    </aside>
  );
}
