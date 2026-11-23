import { Link } from 'react-router-dom';

/**
 * SpendWell Brand Logo
 * - Sophisticated Espresso & Champagne Luxury Aesthetic
 * - Playful, rounded modern wordmark with "Spend" & "Well" styling
 * - Creative smiling champagne coin symbol with warm golden finish
 * - Variants: 'dark' (for dark landing page / auth), 'light' (for light dashboard), 'auto'
 */
export function SpendWellLogo({
  to = '/',
  variant = 'auto',
  size = 'default', // 'sm' | 'default' | 'lg'
  link = true,
  className = '',
}) {
  const content = (
    <span className={`spendwell-brand brand-${variant} brand-${size} ${className}`}>
      <span className="brand-icon-wrap" aria-hidden="true">
        <svg
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-coin-svg"
        >
          <defs>
            {/* Warm Champagne & Mocha Coin Gradient */}
            <linearGradient id="swCoinGrad" x1="2" y1="2" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8DCCB" />
              <stop offset="0.45" stopColor="#C6A77B" />
              <stop offset="1" stopColor="#49372D" />
            </linearGradient>
            {/* Soft Metallic Rim Highlight */}
            <linearGradient id="swInnerGlow" x1="8" y1="8" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="1" stopColor="#FAF6F0" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Outer coin circle */}
          <circle cx="19" cy="19" r="17" fill="url(#swCoinGrad)" />
          <circle cx="19" cy="19" r="15.5" stroke="url(#swInnerGlow)" strokeWidth="1.5" />

          {/* Creative blooming coin petals / lucky money clover */}
          <path
            d="M19 10.5C17.6 13.2 14.8 14.5 12.5 14.5C14.8 15.8 17.6 17.2 19 19.8C20.4 17.2 23.2 15.8 25.5 14.5C23.2 14.5 20.4 13.2 19 10.5Z"
            fill="#FFFFFF"
            opacity="0.92"
          />

          {/* Smiling playful coin curve */}
          <path
            d="M13.5 22.8C15 25.8 23 25.8 24.5 22.8"
            stroke="#211B18"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Joyful coin eyes/sparkles */}
          <circle cx="14" cy="19.2" r="1.3" fill="#211B18" />
          <circle cx="24" cy="19.2" r="1.3" fill="#211B18" />

          {/* Golden Champagne star sparkle */}
          <path
            d="M29 5.5L29.6 7.8L32 8.4L29.6 9L29 11.3L28.4 9L26 8.4L28.4 7.8L29 5.5Z"
            fill="#C6A77B"
          />
        </svg>
      </span>

      <span className="brand-wordmark">
        <span className="word-spend">Spend</span>
        <span className="word-well">
          Well
          <span className="well-sparkle">✦</span>
        </span>
      </span>
    </span>
  );

  if (!link) {
    return content;
  }

  return (
    <Link to={to} className="brand-link" aria-label="SpendWell Home">
      {content}
    </Link>
  );
}

export default SpendWellLogo;
