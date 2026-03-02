interface KuberLogoProps {
  size?: number;
  className?: string;
}

export function KuberLogo({ size = 120, className = "" }: KuberLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kuber Panel Logo"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Outermost gold ring */}
      <circle cx="60" cy="60" r="59" fill="#D4A017" />

      {/* Gold shimmer highlight on outer ring */}
      <circle
        cx="60"
        cy="60"
        r="59"
        fill="none"
        stroke="#F5D060"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Thin black separator */}
      <circle cx="60" cy="60" r="55" fill="#050508" />

      {/* Thin gold inner separator */}
      <circle cx="60" cy="60" r="53" fill="#B8860B" opacity="0.7" />

      {/* Main dark background */}
      <circle cx="60" cy="60" r="51" fill="#0f0f1a" />

      {/* Subtle radial highlight on dark bg */}
      <circle
        cx="60"
        cy="60"
        r="51"
        fill="url(#kuber-shine-static)"
        opacity="0.8"
      />

      {/* Inner thin gold ring line */}
      <circle
        cx="60"
        cy="60"
        r="51"
        fill="none"
        stroke="#D4A017"
        strokeWidth="0.7"
        opacity="0.6"
      />

      {/* ===== K lettermark — thick bold ===== */}
      {/* Vertical left bar */}
      <rect x="31" y="28" width="10" height="48" rx="2.5" fill="#D4A017" />
      <rect
        x="31"
        y="28"
        width="10"
        height="48"
        rx="2.5"
        fill="url(#kuber-k-shine)"
      />

      {/* Upper arm of K */}
      <polygon points="41,50 72,28 83,28 52,52" fill="#D4A017" />
      <polygon points="41,50 72,28 83,28 52,52" fill="url(#kuber-k-shine)" />

      {/* Lower arm of K */}
      <polygon points="41,50 72,76 83,76 52,52" fill="#D4A017" />
      <polygon points="41,50 72,76 83,76 52,52" fill="url(#kuber-k-shine)" />

      {/* ===== ₹ Rupee symbol (top-right) ===== */}
      <g transform="translate(68, 24)">
        {/* Top horizontal bar */}
        <line
          x1="2"
          y1="3"
          x2="15"
          y2="3"
          stroke="#F5D060"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Second horizontal bar */}
        <line
          x1="2"
          y1="7"
          x2="15"
          y2="7"
          stroke="#F5D060"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Vertical left stroke */}
        <line
          x1="5.5"
          y1="3"
          x2="5.5"
          y2="20"
          stroke="#F5D060"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Diagonal stroke */}
        <line
          x1="5.5"
          y1="7"
          x2="14"
          y2="20"
          stroke="#F5D060"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Arc for ₹ */}
        <path
          d="M5.5,3 Q14,3 14,5.5 Q14,9 5.5,9"
          stroke="#F5D060"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* ===== KUBER text (top arc area) ===== */}
      <text
        x="60"
        y="22"
        fontSize="9"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        letterSpacing="3"
        textAnchor="middle"
        fill="#F5D060"
      >
        KUBER
      </text>

      {/* ===== PANEL text (bottom) ===== */}
      <text
        x="60"
        y="98"
        fontSize="8"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        letterSpacing="3.5"
        textAnchor="middle"
        fill="#F5D060"
      >
        PANEL
      </text>

      {/* Decorative side lines */}
      <line
        x1="22"
        y1="55"
        x2="29"
        y2="55"
        stroke="#C8872A"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />
      <line
        x1="91"
        y1="55"
        x2="98"
        y2="55"
        stroke="#C8872A"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />

      {/* Static gradient defs - IDs are fixed strings, no dynamic generation */}
      <defs>
        <radialGradient id="kuber-shine-static" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kuber-k-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE880" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#F5D060" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFE880" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
