import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { useTransactions } from '../context/TransactionContext.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { AppShell } from '../components/AppShell.jsx';
import { formatNPR, formatNPRCompact } from '../lib/currency.js';

// Sophisticated Espresso & Champagne luxury category palette
const CATEGORY_COLORS = [
  '#C6A77B', // Champagne
  '#A85A44', // Warm Terracotta
  '#5E7A5A', // Muted Green
  '#49372D', // Mocha
  '#D4B88E', // Light Champagne
  '#8C6D58', // Warm Cocoa
  '#BC987E', // Tawny Beige
  '#211B18', // Espresso
];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="luxury-recharts-tooltip">
      <p className="tooltip-title">{label}</p>
      {payload.map((entry, idx) => (
        <div key={entry.name || idx} className="tooltip-entry" style={{ color: entry.color }}>
          <span className="entry-dot" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <strong>{formatNPR(entry.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="luxury-recharts-tooltip">
      <div className="tooltip-entry" style={{ color: d.payload.fill }}>
        <span className="entry-dot" style={{ backgroundColor: d.payload.fill }} />
        <strong>{d.name}</strong>
      </div>
      <p className="tooltip-val">{formatNPR(d.value)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, loading, error, refreshAll } = useTransactions();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const monthly = summary?.monthly ?? [];
  const catEntries = Object.entries(summary?.categoryBreakdown ?? {});
  const pieData = catEntries.map(([name, amount]) => ({ name, amount }));

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading && !summary) {
    return (
      <AppShell>
        <div className="page-loading">
          <div className="luxury-spinner" />
          <p>Opening your SpendWell dashboard…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page light-luxury">
        {/* ── Dashboard Welcome Header ─────────────────────────── */}
        <div className="dashboard-hero-header">
          <div className="greeting-block">
            <span className="greeting-pill">SPENDWELL OVERVIEW</span>
            <h1 className="dashboard-title">{greeting}, {user?.name?.split(' ')[0] || 'Member'}.</h1>
            <p className="dashboard-subtitle">
              Here is your personal financial health overview in Nepali Rupees (रु.).
            </p>
          </div>

          <div className="dashboard-quick-actions">
            <Link to="/income" className="btn-dash-action btn-add-income">
              <span>+ Add Income</span>
            </Link>
            <Link to="/expenses" className="btn-dash-action btn-add-expense">
              <span>- Add Expense</span>
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Summary StatCards (Light Luxury) ─────────────────── */}
        <div className="stat-grid">
          <StatCard
            label="Total Balance"
            amount={summary?.balance}
            accent="espresso"
            icon="रु"
            subtext={(summary?.balance ?? 0) >= 0 ? 'Healthy positive balance' : 'Negative balance warning'}
          />
          <StatCard
            label="Total Income"
            amount={summary?.totalIncome}
            accent="income"
            icon="↑"
            subtext="All recorded earnings"
          />
          <StatCard
            label="Total Expenses"
            amount={summary?.totalExpenses}
            accent="expense"
            icon="↓"
            subtext="All recorded spending"
          />
        </div>

        {/* ── Recharts Grid (Light Luxury) ────────────────────── */}
        <div className="chart-grid">
          {/* Monthly Income vs Expenses Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Monthly Income vs Expenses</h2>
                <p className="chart-sub">Comparing cash flow in Nepali Rupees (रु.)</p>
              </div>
              <Link to="/reports" className="chart-link-more">Full Reports →</Link>
            </div>

            {monthly.every((m) => m.income === 0 && m.expenses === 0) ? (
              <div className="chart-empty">
                <span className="empty-chart-icon">📊</span>
                <p>No monthly activity recorded yet</p>
                <Link to="/income" className="empty-action-link">Add your first transaction</Link>
              </div>
            ) : (
              <div className="chart-wrap chart-wrap-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DCCB" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6E6156' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={formatNPRCompact}
                      tick={{ fontSize: 11, fill: '#6E6156' }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />
                    <RTooltip content={<BarTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                      formatter={(val) => <span style={{ color: '#211B18', fontWeight: 600 }}>{val}</span>}
                    />
                    <Bar dataKey="income" name="Income" fill="#5E7A5A" radius={[6, 6, 0, 0]} maxBarSize={38} />
                    <Bar dataKey="expenses" name="Expenses" fill="#A85A44" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Pie Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Expenses by Category</h2>
                <p className="chart-sub">Where your money went</p>
              </div>
              <Link to="/expenses" className="chart-link-more">Add Expense →</Link>
            </div>

            {pieData.length === 0 ? (
              <div className="chart-empty">
                <span className="empty-chart-icon">🛍️</span>
                <p>No expense data recorded yet</p>
                <Link to="/expenses" className="empty-action-link">Log an expense</Link>
              </div>
            ) : (
              <div className="chart-wrap chart-wrap-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="78%"
                      innerRadius="44%"
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ strokeWidth: 1.2, stroke: '#C6A77B' }}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions (Light Luxury) ──────────────── */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Recent Transactions</h2>
              <p className="card-subtitle-small">Your latest 5 financial logs</p>
            </div>
            <Link to="/transactions" className="btn-table-action">
              View All Transactions →
            </Link>
          </div>

          {!summary?.recentTransactions?.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">📝</span>
              <p className="empty-state-title">No transactions recorded yet</p>
              <p className="empty-state-subtitle">Start by recording your first income or expense.</p>
              <div className="empty-state-actions">
                <Link to="/income" className="btn-empty btn-empty-income">+ Add Income</Link>
                <Link to="/expenses" className="btn-empty btn-empty-expense">- Add Expense</Link>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Detail / Category</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <div className={`tx-badge tx-badge-${tx.type}`}>
                          <span className="badge-symbol">{tx.type === 'income' ? '↑' : '↓'}</span>
                          <span className="badge-text">{tx.type === 'income' ? 'Income' : 'Expense'}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="tx-title">{tx.source || tx.category}</strong>
                      </td>
                      <td className="tx-date-cell">{fmtDate(tx.date)}</td>
                      <td className="tx-desc-cell">{tx.description || '—'}</td>
                      <td className="text-right">
                        <div className={`tx-amount tx-amount-${tx.type}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatNPR(tx.amount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
