import { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { SpendWellLogo } from './SpendWellLogo.jsx';

export function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell light-luxury-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="shell-main">
        {/* Mobile top bar */}
        <header className="topbar light-luxury-topbar">
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu drawer"
          >
            ☰
          </button>
          <div className="topbar-brand">
            <SpendWellLogo variant="light" size="sm" to="/dashboard" />
          </div>
        </header>

        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
