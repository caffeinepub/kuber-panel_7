interface KuberLogoProps {
  size?: number;
  className?: string;
}

export function KuberLogo({ size = 120, className = "" }: KuberLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kuber Panel Logo"
      role="img"
    >
      <defs>
        {/* Silver outer ring gradient */}
        <linearGradient id="silverRing1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#c8c8c8" />
          <stop offset="40%" stopColor="#e8e8e8" />
          <stop offset="60%" stopColor="#a0a0a0" />
          <stop offset="80%" stopColor="#d4d4d4" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Silver inner ring gradient */}
        <linearGradient id="silverRing2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="25%" stopColor="#b0b0b0" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="75%" stopColor="#909090" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>

        {/* Dark navy background */}
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#050e1a" />
        </linearGradient>

        {/* Gold fill for crown and K */}
        <linearGradient id="goldFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe680" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="65%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>

        {/* Gold ring accent */}
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d060" />
          <stop offset="50%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#f5d060" />
        </linearGradient>

        {/* Glow center */}
        <radialGradient id="glowCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4a017" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
        </radialGradient>

        {/* Silver shine radial */}
        <radialGradient id="silverShine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === OUTER SILVER RING 1 (outermost) === */}
      <circle cx="100" cy="100" r="99" fill="url(#silverRing1)" />

      {/* Gap between rings - dark */}
      <circle cx="100" cy="100" r="94" fill="#111827" />

      {/* === INNER SILVER RING 2 === */}
      <circle cx="100" cy="100" r="91" fill="url(#silverRing2)" />

      {/* Silver shine overlay on ring 2 */}
      <circle cx="100" cy="100" r="91" fill="url(#silverShine)" />

      {/* Main dark background inside */}
      <circle cx="100" cy="100" r="86" fill="url(#bgGrad)" />

      {/* Glow overlay */}
      <circle cx="100" cy="100" r="86" fill="url(#glowCenter)" />

      {/* Thin gold accent ring inside */}
      <circle
        cx="100"
        cy="100"
        r="82"
        fill="none"
        stroke="url(#goldAccent)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* === CROWN === */}
      {/* Left crown point */}
      <polygon
        points="55,75 61,54 70,70"
        fill="url(#goldFill)"
        filter="url(#glow)"
      />
      {/* Center crown point (tallest) */}
      <polygon
        points="87,70 100,44 113,70"
        fill="url(#goldFill)"
        filter="url(#glow)"
      />
      {/* Right crown point */}
      <polygon
        points="130,70 139,54 145,75"
        fill="url(#goldFill)"
        filter="url(#glow)"
      />

      {/* Crown body */}
      <path
        d="M51 75 L55 75 L70 70 L87 70 L100 44 L113 70 L130 70 L145 75 L149 75 L149 93 Q149 98 143 98 L57 98 Q51 98 51 93 Z"
        fill="url(#goldFill)"
        filter="url(#glow)"
      />

      {/* Crown base bar */}
      <rect
        x="49"
        y="91"
        width="102"
        height="10"
        rx="3"
        fill="url(#goldFill)"
      />

      {/* Crown gems */}
      <circle
        cx="100"
        cy="81"
        r="5"
        fill="#050e1a"
        stroke="url(#goldAccent)"
        strokeWidth="1.5"
      />
      <circle
        cx="75"
        cy="79"
        r="3.5"
        fill="#050e1a"
        stroke="url(#goldAccent)"
        strokeWidth="1.2"
      />
      <circle
        cx="125"
        cy="79"
        r="3.5"
        fill="#050e1a"
        stroke="url(#goldAccent)"
        strokeWidth="1.2"
      />

      {/* Crown tip stars */}
      <circle
        cx="61"
        cy="52"
        r="2.5"
        fill="url(#goldFill)"
        opacity="0.95"
        filter="url(#glow)"
      />
      <circle
        cx="100"
        cy="42"
        r="3"
        fill="url(#goldFill)"
        opacity="0.95"
        filter="url(#glow)"
      />
      <circle
        cx="139"
        cy="52"
        r="2.5"
        fill="url(#goldFill)"
        opacity="0.95"
        filter="url(#glow)"
      />

      {/* === K Letter === */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="52"
        fontWeight="bold"
        fill="url(#goldFill)"
        filter="url(#glow)"
      >
        K
      </text>

      {/* Divider line under K */}
      <line
        x1="58"
        y1="157"
        x2="142"
        y2="157"
        stroke="url(#goldAccent)"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* KUBER PANEL text */}
      <text
        x="100"
        y="171"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="10.5"
        fontWeight="bold"
        letterSpacing="3"
        fill="url(#goldFill)"
      >
        KUBER PANEL
      </text>

      {/* Decorative dots */}
      <circle cx="54" cy="167" r="1.8" fill="url(#goldFill)" opacity="0.7" />
      <circle cx="146" cy="167" r="1.8" fill="url(#goldFill)" opacity="0.7" />

      {/* Silver ring shine highlights - top arc */}
      <path
        d="M 30 55 A 75 75 0 0 1 110 22"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Outer ring top highlight */}
      <path
        d="M 25 65 A 82 82 0 0 1 105 18"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}
