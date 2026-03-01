interface KuberLogoProps {
  size?: number;
  className?: string;
}

export function KuberLogo({ size = 120, className = "" }: KuberLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kuber Panel Logo"
      role="img"
    >
      <defs>
        {/* Deep black-gold radial bg */}
        <radialGradient id="kp-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a1200" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Premium gold gradient */}
        <linearGradient id="kp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff0a0" />
          <stop offset="20%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#c8920a" />
          <stop offset="80%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>

        {/* Bright gold for accents */}
        <linearGradient id="kp-gold2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#d4a012" />
        </linearGradient>

        {/* Outer ring - platinum/chrome */}
        <linearGradient id="kp-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="15%" stopColor="#c0c0c0" />
          <stop offset="30%" stopColor="#f8f8f8" />
          <stop offset="50%" stopColor="#888888" />
          <stop offset="70%" stopColor="#e0e0e0" />
          <stop offset="85%" stopColor="#a0a0a0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Middle ring - dark gold */}
        <linearGradient id="kp-darkgold" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8920a" />
          <stop offset="30%" stopColor="#ffd700" />
          <stop offset="60%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>

        {/* Inner ring - deep gold */}
        <linearGradient id="kp-ring3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a07000" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#c8920a" />
        </linearGradient>

        {/* K letter gradient */}
        <linearGradient id="kp-k" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5b0" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#c8920a" />
        </linearGradient>

        {/* Glow filters */}
        <filter id="kp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="kp-strongglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="kp-textglow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shine overlay */}
        <radialGradient id="kp-shine" cx="35%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Inner glow */}
        <radialGradient id="kp-innerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#ffd700" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* === RING 1: Platinum/Chrome outer (largest) === */}
      <circle cx="120" cy="120" r="118" fill="url(#kp-chrome)" />

      {/* Gap 1 */}
      <circle cx="120" cy="120" r="112" fill="#050505" />

      {/* === RING 2: Gold ring === */}
      <circle cx="120" cy="120" r="109" fill="url(#kp-darkgold)" />

      {/* Gap 2 */}
      <circle cx="120" cy="120" r="104" fill="#080808" />

      {/* === RING 3: Thin gold inner ring === */}
      <circle cx="120" cy="120" r="101" fill="url(#kp-ring3)" />

      {/* Main body background */}
      <circle cx="120" cy="120" r="97" fill="url(#kp-bg)" />

      {/* Inner glow overlay */}
      <circle cx="120" cy="120" r="97" fill="url(#kp-innerGlow)" />

      {/* Shine overlay */}
      <circle cx="120" cy="120" r="97" fill="url(#kp-shine)" />

      {/* === DECORATIVE: 8 diamond dots on outer circle === */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 120 + 110 * Math.sin(rad);
        const cy = 120 - 110 * Math.cos(rad);
        return (
          <circle
            key={angle}
            cx={cx}
            cy={cy}
            r={angle % 90 === 0 ? 3.5 : 2.2}
            fill="url(#kp-gold)"
            filter="url(#kp-glow)"
            opacity="0.9"
          />
        );
      })}

      {/* === CROWN: Premium 5-point crown === */}
      {/* Crown base */}
      <path
        d="M 68 100 L 68 87 L 84 96 L 100 62 L 120 78 L 140 62 L 156 96 L 172 87 L 172 100 Q 172 108 164 108 L 76 108 Q 68 108 68 100 Z"
        fill="url(#kp-gold)"
        filter="url(#kp-strongglow)"
      />

      {/* Crown base bottom bar */}
      <rect
        x="66"
        y="104"
        width="108"
        height="11"
        rx="4"
        fill="url(#kp-gold2)"
        filter="url(#kp-glow)"
      />

      {/* Crown gems - 3 jewels */}
      <ellipse cx="120" cy="94" rx="6" ry="5.5" fill="#0a0a0a" />
      <ellipse
        cx="120"
        cy="94"
        rx="4"
        ry="3.5"
        fill="#1a0a00"
        stroke="url(#kp-gold)"
        strokeWidth="1"
      />
      <circle cx="120" cy="94" r="2" fill="#ffd700" opacity="0.6" />

      <ellipse cx="95" cy="91" rx="4.5" ry="4" fill="#0a0a0a" />
      <circle
        cx="95"
        cy="91"
        r="2.2"
        fill="#1a0a00"
        stroke="url(#kp-gold)"
        strokeWidth="0.8"
      />

      <ellipse cx="145" cy="91" rx="4.5" ry="4" fill="#0a0a0a" />
      <circle
        cx="145"
        cy="91"
        r="2.2"
        fill="#1a0a00"
        stroke="url(#kp-gold)"
        strokeWidth="0.8"
      />

      {/* Crown point stars/circles */}
      <circle
        cx="84"
        cy="95"
        r="3"
        fill="url(#kp-gold)"
        filter="url(#kp-glow)"
      />
      <circle
        cx="100"
        cy="61"
        r="3.5"
        fill="url(#kp-gold)"
        filter="url(#kp-glow)"
      />
      <circle
        cx="120"
        cy="77"
        r="3"
        fill="url(#kp-gold)"
        filter="url(#kp-glow)"
      />
      <circle
        cx="140"
        cy="61"
        r="3.5"
        fill="url(#kp-gold)"
        filter="url(#kp-glow)"
      />
      <circle
        cx="156"
        cy="95"
        r="3"
        fill="url(#kp-gold)"
        filter="url(#kp-glow)"
      />

      {/* === BIG K LETTER === */}
      <text
        x="120"
        y="163"
        textAnchor="middle"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontSize="58"
        fontWeight="900"
        fill="url(#kp-k)"
        filter="url(#kp-strongglow)"
        letterSpacing="-2"
      >
        K
      </text>

      {/* Divider line */}
      <line
        x1="68"
        y1="170"
        x2="172"
        y2="170"
        stroke="url(#kp-gold)"
        strokeWidth="1.2"
        opacity="0.7"
      />

      {/* Small diamond left */}
      <polygon
        points="72,170 75,166 78,170 75,174"
        fill="url(#kp-gold)"
        opacity="0.8"
        filter="url(#kp-glow)"
      />
      {/* Small diamond right */}
      <polygon
        points="162,170 165,166 168,170 165,174"
        fill="url(#kp-gold)"
        opacity="0.8"
        filter="url(#kp-glow)"
      />

      {/* KUBER PANEL text */}
      <text
        x="120"
        y="186"
        textAnchor="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="4.5"
        fill="url(#kp-gold2)"
        filter="url(#kp-textglow)"
      >
        KUBER PANEL
      </text>

      {/* Tagline */}
      <text
        x="120"
        y="200"
        textAnchor="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize="7"
        fontWeight="400"
        letterSpacing="2.5"
        fill="#c8920a"
        opacity="0.8"
      >
        FINANCIAL PLATFORM
      </text>

      {/* Chrome ring shine arc (top-left) */}
      <path
        d="M 28 80 A 100 100 0 0 1 110 22"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Outer ring shine */}
      <path
        d="M 15 90 A 112 112 0 0 1 115 10"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  );
}
