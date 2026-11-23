import { formatNPR } from '../lib/currency.js';

/**
 * Reusable Luxury StatCard formatted in Nepali Rupees (रु.)
 */
export function StatCard({ label, amount, accent = 'espresso', icon = '◈', subtext = '' }) {
  const formatted = formatNPR(amount ?? 0);

  return (
    <div className={`luxury-stat-card card-accent-${accent}`}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon" aria-hidden="true">{icon}</div>
      </div>
      <div className="stat-card-amount">{formatted}</div>
      {subtext && <div className="stat-card-subtext">{subtext}</div>}
      <div className="stat-card-bar" aria-hidden="true" />
    </div>
  );
}

export default StatCard;
