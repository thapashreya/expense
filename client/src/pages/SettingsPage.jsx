import { useAuth } from '../context/AuthContext.jsx';
import { AppShell } from '../components/AppShell.jsx';
import { CURRENCY_CODE, CURRENCY_SYMBOL } from '../lib/currency.js';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="page light-luxury">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings & Preferences</h1>
            <p className="page-subtitle">Manage your SpendWell profile and application preferences</p>
          </div>
        </div>

        <div className="settings-grid">
          {/* User Profile Card */}
          <div className="card settings-card">
            <h2 className="card-title">User Profile</h2>
            <div className="profile-detail-row">
              <div className="profile-large-avatar" aria-hidden="true">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="profile-meta">
                <h3 className="profile-name">{user?.name || 'SpendWell User'}</h3>
                <p className="profile-email">{user?.email}</p>
                <span className="profile-status-pill">Active Account · Verified</span>
              </div>
            </div>

            <div className="settings-fields-group">
              <div className="settings-field">
                <span className="s-label">Full Name</span>
                <span className="s-value">{user?.name}</span>
              </div>
              <div className="settings-field">
                <span className="s-label">Registered Email</span>
                <span className="s-value">{user?.email}</span>
              </div>
              <div className="settings-field">
                <span className="s-label">User Identifier</span>
                <span className="s-value font-mono">{user?.id || user?._id || 'Authenticated'}</span>
              </div>
            </div>
          </div>

          {/* Regional & Currency Preferences */}
          <div className="card settings-card">
            <h2 className="card-title">Currency & Regional Settings</h2>
            <div className="currency-box">
              <div className="currency-badge-icon">🇳🇵</div>
              <div className="currency-details">
                <strong>Primary Currency</strong>
                <p>Nepali Rupee ({CURRENCY_SYMBOL} {CURRENCY_CODE})</p>
              </div>
              <span className="currency-active-pill">Standard Native</span>
            </div>

            <p className="settings-note">
              SpendWell natively displays all transactions, summaries, and charts in
              Nepali Rupees (रु.) using South Asian numerical comma separation (e.g., रु. 12,500).
            </p>
          </div>

          {/* Data Security & Privacy */}
          <div className="card settings-card">
            <h2 className="card-title">Privacy & Security</h2>
            <div className="security-badges-list">
              <div className="sec-item">
                <span className="sec-icon">🔒</span>
                <div>
                  <strong>Bcrypt 12 Salt Rounds</strong>
                  <p>Your password is encrypted with industry-standard bcrypt hashing.</p>
                </div>
              </div>
              <div className="sec-item">
                <span className="sec-icon">🛡️</span>
                <div>
                  <strong>HttpOnly Session Security</strong>
                  <p>Session cookies are restricted from client-side script access for XSS protection.</p>
                </div>
              </div>
              <div className="sec-item">
                <span className="sec-icon">👤</span>
                <div>
                  <strong>Single-User Scoped Data</strong>
                  <p>All database queries strictly isolate records matching your specific user ID.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

