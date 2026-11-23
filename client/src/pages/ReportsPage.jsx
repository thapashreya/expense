import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { reportsApi } from '../lib/api.js';
import { AppShell } from '../components/AppShell.jsx';
import { formatNPR, formatNPRCompact } from '../lib/currency.js';

// Sophisticated Espresso & Champagne luxury palette
const CATEGORY_COLORS = [
  '#C6A77B', '#A85A44', '#5E7A5A', '#49372D',
  '#D4B88E', '#8C6D58', '#BC987E', '#211B18',
];

function CustomTooltip({ active, payload, label }) {
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
      <p className="tooltip-val">{formatNPR(d.value)} ({d.payload.percent}%)</p>
    </div>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthRange, setMonthRange] = useState(6);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.get(monthRange);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [monthRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  if (loading && !report) {
    return (
      <AppShell>
        <div className="page-loading">
          <div className="luxury-spinner" />
          <p>Analyzing your financial reports…</p>
        </div>
      </AppShell>
    );
  }

  const monthly = report?.monthly ?? [];
  const catData = report?.categoryBreakdown ?? [];
  const srcData = report?.incomeBreakdown ?? [];
  const hasData = report && report.transactionCount > 0;

  return (
    <AppShell>
      <div className="page light-luxury">
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive financial breakdown in Nepali Rupees (रु.)</p>
          </div>
          <div className="page-header-actions">
            <div className="filter-tabs">
              {[6, 12].map((m) => (
                <button
                  key={m}
                  className={`filter-tab${monthRange === m ? ' filter-tab-active' : ''}`}
                  onClick={() => setMonthRange(m)}
                >
                  {m} Months
                </button>
              ))}
            </div>
            {hasData && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => window.print()}
                title="Print or save financial statement as PDF"
              >
                🖨️ Print Statement
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Key Metrics ─────────────────────────────────────── */}
        <div className="report-metrics">
          <div className="metric-card metric-card-income">
            <div className="metric-label">Total Recorded Income</div>
            <div className="metric-value text-income">{formatNPR(report?.totalIncome)}</div>
            <div className="metric-sub">Cumulative earnings</div>
          </div>
          <div className="metric-card metric-card-expense">
            <div className="metric-label">Total Recorded Expenses</div>
            <div className="metric-value text-expense">{formatNPR(report?.totalExpenses)}</div>
            <div className="metric-sub">Cumulative spending</div>
          </div>
          <div className="metric-card metric-card-espresso">
            <div className="metric-label">Net Balance</div>
            <div className={`metric-value ${(report?.balance ?? 0) >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatNPR(report?.balance)}
            </div>
            <div className="metric-sub">Income minus expenses</div>
          </div>
          <div className="metric-card metric-card-champagne">
            <div className="metric-label">Savings Rate</div>
            <div className="metric-value text-espresso">
              {report?.totalIncome ? `${report.savingsRate}%` : '—'}
            </div>
            <div className="metric-sub">Portion of earnings saved</div>
          </div>
        </div>

        {!hasData ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <p className="empty-title">No financial data to analyze yet</p>
              <p className="empty-desc">Record income and expenses to unlock your interactive charts and reports.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Monthly Income vs Expenses (Bar chart) ────── */}
            <div className="chart-grid">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h2 className="chart-title">Monthly Cash Flow Comparison</h2>
                    <p className="chart-sub">Income (Muted Green) vs Expenses (Terracotta) in रु.</p>
                  </div>
                </div>
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
                      <RTooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                        formatter={(val) => <span style={{ color: '#211B18', fontWeight: 600 }}>{val}</span>}
                      />
                      <Bar dataKey="income" name="Income" fill="#5E7A5A" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="expenses" name="Expenses" fill="#A85A44" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Category-wise Expense Breakdown (Donut) ──── */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h2 className="chart-title">Expense by Category</h2>
                    <p className="chart-sub">Percentage allocation of total spending</p>
                  </div>
                </div>
                {catData.length === 0 ? (
                  <div className="chart-empty">No expense categories to display</div>
                ) : (
                  <div className="chart-wrap chart-wrap-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={catData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="78%"
                          innerRadius="44%"
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${percent}%`}
                          labelLine={{ strokeWidth: 1.2, stroke: '#C6A77B' }}
                        >
                          {catData.map((entry, i) => (
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

            {/* ── Monthly Net Balance Bar Chart ─────────────── */}
            <div className="card">
              <div className="chart-card-header">
                <div>
                  <h2 className="chart-title">Monthly Net Savings Trend</h2>
                  <p className="chart-sub">Positive (Green) or deficit (Terracotta) per calendar month in Nepali Rupees</p>
                </div>
              </div>
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
                    <RTooltip content={<CustomTooltip />} />
                    <Bar dataKey="balance" name="Net Balance" radius={[6, 6, 0, 0]} maxBarSize={42}>
                      {monthly.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.balance >= 0 ? '#5E7A5A' : '#A85A44'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Monthly Breakdown Table ───────────────────── */}
            <div className="card">
              <div className="card-header-flex">
                <div>
                  <h2 className="card-title">Monthly Summary Table</h2>
                  <p className="card-subtitle-small">Detailed income, expenses, and savings per month</p>
                </div>
              </div>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Income (NPR)</th>
                      <th>Expenses (NPR)</th>
                      <th>Net Balance (NPR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map((m) => (
                      <tr key={m.label}>
                        <td><strong>{m.fullLabel || m.label}</strong></td>
                        <td className="text-sage">{formatNPR(m.income)}</td>
                        <td className="text-rose">{formatNPR(m.expenses)}</td>
                        <td className={m.balance >= 0 ? 'text-sage font-bold' : 'text-rose font-bold'}>
                          {formatNPR(m.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Category Breakdown Table ──────────────────── */}
            {catData.length > 0 && (
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h2 className="card-title">Category-Wise Breakdown</h2>
                    <p className="card-subtitle-small">Exact amounts and percentage share of total expenditure</p>
                  </div>
                </div>
                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total Spent (NPR)</th>
                        <th>% of Total</th>
                        <th style={{ width: '35%' }}>Distribution Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catData.map((c, i) => (
                        <tr key={c.name}>
                          <td>
                            <span
                              className="cat-dot"
                              style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                            />
                            <strong>{c.name}</strong>
                          </td>
                          <td>{formatNPR(c.amount)}</td>
                          <td>{c.percent}%</td>
                          <td>
                            <div className="cat-bar-track">
                              <div
                                className="cat-bar-fill"
                                style={{
                                  width: `${Math.min(c.percent, 100)}%`,
                                  background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Income Sources Table ──────────────────────── */}
            {srcData.length > 0 && (
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h2 className="card-title">Income Sources</h2>
                    <p className="card-subtitle-small">Earning streams and contribution share</p>
                  </div>
                </div>
                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Amount (NPR)</th>
                        <th>% of Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {srcData.map((s) => (
                        <tr key={s.name}>
                          <td><strong>{s.name}</strong></td>
                          <td className="text-sage">{formatNPR(s.amount)}</td>
                          <td>{s.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
