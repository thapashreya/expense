import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { TransactionProvider } from './context/TransactionContext.jsx';
import { SpendWellLogo } from './components/SpendWellLogo.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IncomePage from './pages/IncomePage.jsx';
import ExpensePage from './pages/ExpensePage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

/* ─── Protected route guard ───────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { user, loading, error, refreshUser } = useAuth();

  if (loading) {
    return (
      <main className="loading-screen dark-luxury">
        <SpendWellLogo variant="dark" size="lg" link={false} />
        <div className="luxury-spinner" />
        <p className="loading-text">Preparing your SpendWell private space…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="loading-screen dark-luxury">
        <SpendWellLogo variant="dark" size="default" link={false} />
        <p className="loading-error" role="alert">{error}</p>
        <button className="btn-primary retry-button" onClick={refreshUser}>Try Again</button>
      </main>
    );
  }

  return user ? (
    <TransactionProvider>{children}</TransactionProvider>
  ) : (
    <Navigate replace to="/login" />
  );
}

/* ─── App Router ──────────────────────────────────────────────── */
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route
        path="/"
        element={user ? <Navigate replace to="/dashboard" /> : <LandingPage />}
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={user ? <Navigate replace to="/dashboard" /> : <AuthPage mode="login" />}
      />
      <Route
        path="/register"
        element={user ? <Navigate replace to="/dashboard" /> : <AuthPage mode="register" />}
      />

      {/* Protected Dashboard & Management Pages (Light Luxury Theme) */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/income"
        element={<ProtectedRoute><IncomePage /></ProtectedRoute>}
      />
      <Route
        path="/expenses"
        element={<ProtectedRoute><ExpensePage /></ProtectedRoute>}
      />
      <Route
        path="/transactions"
        element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute><ReportsPage /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate replace to={user ? '/dashboard' : '/'} />}
      />
    </Routes>
  );
}
