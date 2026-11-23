import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SpendWellLogo } from '../components/SpendWellLogo.jsx';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Quick client-side validations
    if (isRegister && form.name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
      } else {
        await login({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
      }
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-luxury-page dark-luxury">
      {/* Background glowing luxury orbs */}
      <div className="auth-orb orb-1" aria-hidden="true" />
      <div className="auth-orb orb-2" aria-hidden="true" />
      <div className="auth-orb orb-3" aria-hidden="true" />

      {/* Top back navigation */}
      <header className="auth-header">
        <Link to="/" className="back-to-home">
          <span className="back-arrow" aria-hidden="true">←</span>
          <span>Back to Home</span>
        </Link>
        <SpendWellLogo variant="dark" size="sm" />
      </header>

      {/* Centered Auth Card */}
      <div className="auth-center-wrap">
        <div className="auth-luxury-card">
          <div className="auth-card-head">
            <div className="auth-logo-center">
              <SpendWellLogo variant="dark" size="default" link={false} />
            </div>
            <div className="auth-kicker">
              {isRegister ? 'A FRESH LUXURY START' : 'WELCOME BACK TO SPENDWELL'}
            </div>
            <h1 className="auth-title">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="auth-subtitle">
              {isRegister
                ? 'Begin your luxury personal finance journey in Nepali Rupees.'
                : 'Sign in to access your dashboard, transactions, and reports.'}
            </p>
          </div>

          <form className="auth-luxury-form" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <label className="auth-field">
                <span className="field-label">Full Name</span>
                <div className="field-input-wrap">
                  <span className="field-icon" aria-hidden="true">👤</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="e.g. Aarav Sharma"
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span className="field-label">Email Address</span>
              <div className="field-input-wrap">
                <span className="field-icon" aria-hidden="true">✉</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span className="field-label">Password</span>
              <div className="field-input-wrap">
                <span className="field-icon" aria-hidden="true">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={8}
                  value={form.password}
                  onChange={updateField}
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁‍🗨'}
                </button>
              </div>
              {isRegister && (
                <span className="field-help-text">Use 8 or more characters for security.</span>
              )}
            </label>

            {error && (
              <div className="auth-error-alert" role="alert">
                <span className="error-icon" aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn-auth-submit"
              disabled={submitting}
              type="submit"
            >
              <span>{submitting ? 'Authenticating…' : isRegister ? 'Create My Account' : 'Sign In to Dashboard'}</span>
              {!submitting && <span className="submit-arrow" aria-hidden="true">→</span>}
            </button>
          </form>

          {/* Switch link */}
          <div className="auth-switch-footer">
            <span>{isRegister ? 'Already registered on SpendWell?' : 'New to SpendWell?'}</span>{' '}
            <Link to={isRegister ? '/login' : '/register'} className="auth-switch-link">
              {isRegister ? 'Sign in' : 'Create an account'} <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="auth-privacy-badge">
            <span className="badge-dot" aria-hidden="true">✦</span>
            <span>Zero trackers · Nepali Rupee (रु.) native · Encrypted with bcrypt</span>
          </div>
        </div>
      </div>
    </main>
  );
}

