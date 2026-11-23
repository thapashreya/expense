import { Link } from 'react-router-dom';
import { SpendWellLogo } from '../components/SpendWellLogo.jsx';
import { formatNPR } from '../lib/currency.js';

export default function LandingPage() {
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="landing-page dark-luxury">
      {/* ── Background Warm Ambient Glows (Espresso & Champagne) ── */}
      <div className="ambient-glow glow-1" aria-hidden="true" />
      <div className="ambient-glow glow-2" aria-hidden="true" />
      <div className="ambient-glow glow-3" aria-hidden="true" />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="nav-container">
          <SpendWellLogo variant="dark" size="default" />

          <nav className="nav-links" aria-label="Main navigation">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>Home</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How It Works</a>
            <a href="#preview" onClick={(e) => { e.preventDefault(); scrollTo('preview'); }}>Preview</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-register">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section id="hero" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-sparkle">✦</span>
              <span>Espresso & Champagne Luxury Edition</span>
            </div>

            <h1 className="hero-headline">
              Make Every<br />
              <span className="gradient-text">Rupee Count.</span>
            </h1>

            <p className="hero-subtitle">
              Your money deserves a better plan. Track your spending, manage your income
              and build smarter financial habits with SpendWell.
            </p>

            <div className="hero-cta-group">
              <Link to="/register" className="btn-hero-primary">
                <span>Get Started</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => scrollTo('features')}
              >
                <span>Explore Features</span>
                <span className="btn-icon" aria-hidden="true">↓</span>
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars" aria-hidden="true">
                <span className="t-avatar a1">रु.</span>
                <span className="t-avatar a2">🇳🇵</span>
                <span className="t-avatar a3">✦</span>
              </div>
              <div className="trust-text">
                <strong>Zero ads. Native Nepali Rupees.</strong>
                <span>Private, beautifully crafted and designed for you.</span>
              </div>
            </div>
          </div>

          {/* ── Hero Visual: Floating Dashboard, Wallet & Champagne Coins ── */}
          <div className="hero-visual" aria-label="SpendWell Dashboard Visual Preview">
            <div className="visual-stage">
              {/* Back ambient disc */}
              <div className="visual-halo" aria-hidden="true" />

              {/* Main floating luxury card */}
              <div className="float-card main-dashboard-card">
                <div className="dash-card-header">
                  <div className="dash-card-brand">
                    <span className="card-dot-green" />
                    <span>Live Financial Health</span>
                  </div>
                  <span className="dash-card-chip">रु. NPR</span>
                </div>

                <div className="dash-card-balance">
                  <div className="balance-label">Total Net Balance</div>
                  <div className="balance-val">{formatNPR(148500)}</div>
                  <div className="balance-growth">
                    <span className="growth-pill">+18.4% this month</span>
                    <span className="growth-sub">healthy savings rate</span>
                  </div>
                </div>

                {/* Champagne curved financial chart illustration */}
                <div className="dash-mini-chart" aria-hidden="true">
                  <svg viewBox="0 0 320 90" fill="none" className="mini-chart-svg">
                    <defs>
                      <linearGradient id="champagneChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C6A77B" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#49372D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 75 Q 40 40, 80 55 T 160 30 T 240 45 T 320 15 L 320 90 L 0 90 Z"
                      fill="url(#champagneChartGrad)"
                    />
                    <path
                      d="M0 75 Q 40 40, 80 55 T 160 30 T 240 45 T 320 15"
                      stroke="#C6A77B"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <circle cx="160" cy="30" r="4.5" fill="#FFFFFF" stroke="#C6A77B" strokeWidth="2.5" />
                    <circle cx="320" cy="15" r="5" fill="#C6A77B" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Quick stats ribbon */}
                <div className="dash-quick-ribbon">
                  <div className="ribbon-item">
                    <span className="ribbon-label">Monthly Income</span>
                    <span className="ribbon-val income-color">{formatNPR(85000)}</span>
                  </div>
                  <div className="ribbon-divider" />
                  <div className="ribbon-item">
                    <span className="ribbon-label">Monthly Expenses</span>
                    <span className="ribbon-val expense-color">{formatNPR(32500)}</span>
                  </div>
                </div>
              </div>

              {/* Floating card 1: Income pill card (top right) */}
              <div className="float-card card-income-float float-slow">
                <div className="float-icon-wrap income-icon-bg">
                  <span className="float-icon">↑</span>
                </div>
                <div className="float-info">
                  <span className="float-tag">Monthly Salary</span>
                  <strong className="float-amount text-income">+{formatNPR(75000)}</strong>
                </div>
              </div>

              {/* Floating card 2: Expense pill card (bottom left) */}
              <div className="float-card card-expense-float float-medium">
                <div className="float-icon-wrap expense-icon-bg">
                  <span className="float-icon">🛍️</span>
                </div>
                <div className="float-info">
                  <span className="float-tag">Lifestyle & Dining</span>
                  <strong className="float-amount text-expense">-{formatNPR(4250)}</strong>
                </div>
              </div>

              {/* Floating 3D Leather Wallet & Champagne Coin Illustration */}
              <div className="float-card card-wallet-3d float-fast" aria-hidden="true">
                <svg viewBox="0 0 110 100" fill="none" className="wallet-3d-svg">
                  <defs>
                    <radialGradient id="walletBackdropGlow" cx="0.5" cy="0.5" r="0.5">
                      <stop stopColor="#C6A77B" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#211B18" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="walletLeather" x1="15" y1="20" x2="95" y2="85" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#49372D" />
                      <stop offset="0.6" stopColor="#352820" />
                      <stop offset="1" stopColor="#211B18" />
                    </linearGradient>
                    <linearGradient id="champagneGoldCoin" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FAF6F0" />
                      <stop offset="0.4" stopColor="#C6A77B" />
                      <stop offset="1" stopColor="#8C6D58" />
                    </linearGradient>
                  </defs>

                  {/* Backdrop Glow */}
                  <circle cx="55" cy="50" r="44" fill="url(#walletBackdropGlow)" />

                  {/* 3D Espresso Leather Wallet Body */}
                  <rect x="18" y="28" width="74" height="52" rx="14" fill="url(#walletLeather)" stroke="#C6A77B" strokeOpacity="0.4" strokeWidth="1.5" />
                  <path d="M18 42C18 34 26 28 34 28H76C84 28 92 34 92 42V45H18V42Z" fill="#1A1513" fillOpacity="0.45" />

                  {/* Contrast Champagne Stitching */}
                  <rect x="21" y="31" width="68" height="46" rx="11" fill="none" stroke="#C6A77B" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />

                  {/* Clasp with Champagne Hardware */}
                  <rect x="68" y="46" width="26" height="18" rx="8" fill="#FAF6F0" stroke="#49372D" strokeWidth="1.5" />
                  <circle cx="81" cy="55" r="4" fill="#C6A77B" />

                  {/* Gleaming Champagne Coin Peeking Out */}
                  <g transform="translate(46, 8)">
                    <circle cx="16" cy="16" r="16" fill="url(#champagneGoldCoin)" stroke="#E8DCCB" strokeWidth="1.5" />
                    <text x="16" y="21" textAnchor="middle" fill="#211B18" fontSize="13" fontWeight="800" fontFamily="sans-serif">रु</text>
                  </g>
                </svg>
                <div className="wallet-badge">
                  <span>Smart Savings</span>
                  <strong>+32% Saved</strong>
                </div>
              </div>

              {/* Decorative floating champagne coins & abstract shapes */}
              <div className="deco-shape deco-coin-1" aria-hidden="true">रु</div>
              <div className="deco-shape deco-coin-2" aria-hidden="true">✦</div>
              <div className="deco-shape deco-ring" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section (4 Cards) ─────────────────────────── */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-head text-center">
            <span className="section-kicker">CURATED FINANCIAL CLARITY</span>
            <h2 className="section-title">
              Everything you need to <span className="gradient-text">master your money.</span>
            </h2>
            <p className="section-desc">
              SpendWell removes the stress from personal finance with effortless tracking,
              real-time calculations, and seamless Nepali Rupee formatting.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-expense">
                <span>💸</span>
              </div>
              <h3 className="feature-title">Track Expenses</h3>
              <p className="feature-text">
                Record and organize daily spending effortlessly. Tag items with 8 smart
                categories like Food, Bills, Transportation, and Healthcare.
              </p>
              <div className="feature-preview-chip">
                <span>Instant Category Sorting</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-income">
                <span>💰</span>
              </div>
              <h3 className="feature-title">Manage Income</h3>
              <p className="feature-text">
                Keep thorough track of your earnings from salary, freelance work,
                investments, and bonuses in one clean financial dashboard.
              </p>
              <div className="feature-preview-chip">
                <span>Real-Time Net Balance</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-champagne">
                <span>📊</span>
              </div>
              <h3 className="feature-title">Visual Reports</h3>
              <p className="feature-text">
                Understand where your money goes with interactive Recharts bar charts
                and category-wise pie breakdowns with percentage allocations.
              </p>
              <div className="feature-preview-chip">
                <span>Interactive SVG Charts</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-mocha">
                <span>📅</span>
              </div>
              <h3 className="feature-title">Monthly Overview</h3>
              <p className="feature-text">
                Monitor your financial trajectory across 6 and 12-month views. See your
                net savings rate strengthen month after month.
              </p>
              <div className="feature-preview-chip">
                <span>CSV Export & Print Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Steps) ─────────────────────────────── */}
      <section id="how-it-works" className="how-section">
        <div className="section-container">
          <div className="section-head text-center">
            <span className="section-kicker">EFFORTLESS BY DESIGN</span>
            <h2 className="section-title">
              Three steps to <span className="gradient-text">financial peace of mind.</span>
            </h2>
            <p className="section-desc">
              No complicated spreadsheets, no bank linking, and zero ads. You stay in complete control.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-badge">Quick Start</div>
              <h3 className="step-title">Create your account</h3>
              <p className="step-desc">
                Sign up in seconds with your name and email. Your credentials are securely
                salted and hashed with bcrypt, protected by private JWT sessions.
              </p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-badge">Daily Log</div>
              <h3 className="step-title">Add income & expenses</h3>
              <p className="step-desc">
                Log earnings and spending with custom descriptions and instant category chips.
                All values are stored securely and formatted natively in Nepali Rupees (रु.).
              </p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-badge">Insights</div>
              <h3 className="step-title">Track your progress</h3>
              <p className="step-desc">
                Watch dynamic charts illustrate your savings rate, monthly trends, and spending
                breakdowns. Download CSV spreadsheets anytime with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview Section (Light Luxury Showcase) ──── */}
      <section id="preview" className="preview-section">
        <div className="section-container">
          <div className="section-head text-center">
            <span className="section-kicker">TWO CONTRASTING EXPERIENCES</span>
            <h2 className="section-title">
              A light luxury dashboard <span className="gradient-text">built for daily focus.</span>
            </h2>
            <p className="section-desc">
              Step from our dark luxury welcome into a bright, warm ivory workspace designed for calm and clarity.
            </p>
          </div>

          <div className="dashboard-preview-window">
            <div className="window-chrome">
              <div className="window-dots" aria-hidden="true">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="window-title">SpendWell — Light Luxury Workspace (Ivory #FAF6F0)</div>
              <div className="window-badge">रु. NPR Active</div>
            </div>

            <div className="preview-app-body">
              {/* Preview Sidebar */}
              <div className="preview-sidebar">
                <div className="preview-brand">
                  <SpendWellLogo variant="light" size="sm" link={false} />
                </div>
                <div className="preview-nav-item active">⊞ Overview</div>
                <div className="preview-nav-item">↑ Add Income</div>
                <div className="preview-nav-item">↓ Add Expense</div>
                <div className="preview-nav-item">≡ Transactions</div>
                <div className="preview-nav-item">◎ Reports</div>
                <div className="preview-nav-item">⚙ Settings</div>
              </div>

              {/* Preview Content */}
              <div className="preview-main">
                <div className="preview-top">
                  <div>
                    <h3 className="preview-greeting">Good afternoon, Member.</h3>
                    <p className="preview-sub">Here is your personal financial health overview in Nepali Rupees.</p>
                  </div>
                  <Link to="/register" className="preview-cta-btn">Try Live Demo →</Link>
                </div>

                <div className="preview-cards-row">
                  <div className="preview-stat-card card-balance">
                    <span className="p-card-label">Remaining Balance</span>
                    <strong className="p-card-val">{formatNPR(72500)}</strong>
                    <span className="p-card-sub text-income">Positive cash flow</span>
                  </div>
                  <div className="preview-stat-card card-income">
                    <span className="p-card-label">Total Income</span>
                    <strong className="p-card-val text-income">{formatNPR(105000)}</strong>
                    <span className="p-card-sub">Salary & freelance</span>
                  </div>
                  <div className="preview-stat-card card-expense">
                    <span className="p-card-label">Total Expenses</span>
                    <strong className="p-card-val text-expense">{formatNPR(32500)}</strong>
                    <span className="p-card-sub">Food, bills & lifestyle</span>
                  </div>
                </div>

                <div className="preview-transactions-card">
                  <div className="p-tx-head">
                    <strong>Recent Activity</strong>
                    <span>5 transactions this week</span>
                  </div>
                  <div className="p-tx-item">
                    <span className="p-tx-icon income">↑</span>
                    <div className="p-tx-desc">
                      <strong>Client Consultation</strong>
                      <small>Income · Freelance</small>
                    </div>
                    <span className="p-tx-amount income">+{formatNPR(35000)}</span>
                  </div>
                  <div className="p-tx-item">
                    <span className="p-tx-icon expense">🛍️</span>
                    <div className="p-tx-desc">
                      <strong>Monthly Grocery Stock</strong>
                      <small>Expense · Food</small>
                    </div>
                    <span className="p-tx-amount expense">-{formatNPR(8200)}</span>
                  </div>
                  <div className="p-tx-item">
                    <span className="p-tx-icon expense">⚡</span>
                    <div className="p-tx-desc">
                      <strong>Internet & Electricity</strong>
                      <small>Expense · Bills</small>
                    </div>
                    <span className="p-tx-amount expense">-{formatNPR(3400)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About / Philosophy Section ─────────────────────────── */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="about-box">
            <div className="about-badge">
              <span>✦</span> The SpendWell Philosophy
            </div>
            <h2 className="about-title">
              Designed for calm, elegance,<br />and complete privacy.
            </h2>
            <p className="about-text">
              We believe managing your money shouldn’t feel like taking a math test or giving
              away your credentials to external aggregators. SpendWell provides an elegant sanctuary
              where you can reflect on your finances, build savings momentum, and celebrate positive habits.
            </p>

            <div className="about-pillars">
              <div className="pillar">
                <span className="pillar-num">01</span>
                <strong>Nepali Rupee Native</strong>
                <p>Formatted natively in रु. with comma groupings for authentic day-to-day use.</p>
              </div>
              <div className="pillar">
                <span className="pillar-num">02</span>
                <strong>Private & Self-Contained</strong>
                <p>Every transaction is isolated in MongoDB strictly to your own authenticated user ID.</p>
              </div>
              <div className="pillar">
                <span className="pillar-num">03</span>
                <strong>Espresso & Champagne Luxury</strong>
                <p>A dark luxury landing experience combined with a warm ivory productive dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Call To Action Section ───────────────────────── */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-glow" aria-hidden="true" />
            <span className="cta-pill">READY TO LEVEL UP?</span>
            <h2 className="cta-headline">Your financial glow-up starts here.</h2>
            <p className="cta-sub">
              Join SpendWell today. Experience the elegance of mindful budgeting in pure Nepali Rupees.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn-cta-primary">
                <span>Get Started Now</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                <span>I already have an account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <SpendWellLogo variant="dark" size="default" />
            <p className="footer-tagline">
              A sophisticated personal financial companion crafted in rich Espresso and Champagne luxury.
            </p>
            <div className="footer-currency-note">
              <span>Currency: <strong>Nepali Rupee (रु. NPR)</strong></span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>Home</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How It Works</a></li>
              <li><a href="#preview" onClick={(e) => { e.preventDefault(); scrollTo('preview'); }}>Preview</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Security</h4>
            <ul>
              <li><span>Bcrypt 12 Salt Rounds</span></li>
              <li><span>HttpOnly JWT Cookie</span></li>
              <li><span>Private Mongo User Isolation</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>© {new Date().getFullYear()} SpendWell. Made with care for your real financial life.</p>
            <p className="footer-meta">Espresso & Champagne Luxury Edition · Nepali Rupees (रु.)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
