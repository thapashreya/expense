import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SpendWellLogo } from './SpendWellLogo.jsx';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Overview',      icon: '⊞' },
  { to: '/income',       label: 'Add Income',    icon: '↑' },
  { to: '/expenses',     label: 'Add Expense',   icon: '↓' },
  { to: '/transactions', label: 'Transactions',  icon: '≡' },
  { to: '/reports',      label: 'Reports',       icon: '◎' },
  { to: '/settings',     label: 'Settings',      icon: '⚙' },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Overlay for mobile drawer */}
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar light-luxury-sidebar${open ? ' sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand-box">
          <SpendWellLogo variant="light" size="default" to="/dashboard" />
        </div>

        {/* User Card */}
        <div className="sidebar-user-pill">
          <div className="user-avatar-luxury" aria-hidden="true">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="user-info-luxury">
            <div className="user-name-text" title={user?.name}>{user?.name || 'SpendWell User'}</div>
            <div className="user-role-badge">Nepali Rupee (रु.)</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <div className="nav-group-title">FINANCIAL MENU</div>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `luxury-nav-item${isActive ? ' luxury-nav-active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-item-icon" aria-hidden="true">{icon}</span>
              <span className="nav-item-label">{label}</span>
              <span className="nav-item-indicator" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        {/* Logout action */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span className="nav-item-icon" aria-hidden="true">⇥</span>
            <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
