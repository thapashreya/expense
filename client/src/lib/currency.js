/**
 * Reusable Nepali Rupee (NPR) formatting utilities.
 * Complies with requirement: Display as "रु. 5,000", "रु. 12,500", "रु. 45,000"
 */

export const CURRENCY_SYMBOL = 'रु.';
export const CURRENCY_CODE = 'NPR';

/**
 * Format a number into Nepali Rupees string (e.g. "रु. 12,500")
 * @param {number|string} amount
 * @param {boolean} [showDecimals=false]
 * @returns {string}
 */
export function formatNPR(amount, showDecimals = false) {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const abs = Math.abs(num);

  // en-IN uses the South Asian numbering system (lakhs/crores) or standard thousands
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(abs);

  return `${isNegative ? '-' : ''}रु. ${formatted}`;
}

/**
 * Compact formatting for chart axes or tiny badges (e.g. "रु. 1.5k", "रु. 25k")
 * @param {number|string} amount
 * @returns {string}
 */
export function formatNPRCompact(amount) {
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}रु. ${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}रु. ${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}रु. ${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}रु. ${abs.toFixed(0)}`;
}

