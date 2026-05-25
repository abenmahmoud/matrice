type VerifyBadgeSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<VerifyBadgeSize, number> = {
  sm: 24,
  md: 48,
  lg: 96,
  xl: 192,
};

export function VerifyBadge({
  size = "md",
  confirmed = false,
  className = "",
}: {
  size?: VerifyBadgeSize;
  confirmed?: boolean;
  className?: string;
}) {
  const px = SIZE_MAP[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 192 192"
      role="img"
      aria-label="Matrice Certified"
      className={className}
    >
      <rect width="192" height="192" rx="96" fill="#0B0B0D" />
      <circle cx="96" cy="96" r="84" fill="none" stroke="#C9A961" strokeWidth="5" />
      <circle cx="96" cy="96" r="68" fill="none" stroke="#C9A961" strokeOpacity=".35" strokeWidth="1.5" />
      <text
        x="96"
        y="47"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="21"
        fontWeight="700"
        letterSpacing="5"
        fill="#EDEBE6"
      >
        MATRICE
      </text>
      {confirmed ? (
        <path
          d="M70 99l17 17 36-42"
          fill="none"
          stroke="#C9A961"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M96 62l30 17v30c0 19-13 35-30 42-17-7-30-23-30-42V79l30-17z"
          fill="none"
          stroke="#C9A961"
          strokeWidth="8"
          strokeLinejoin="round"
        />
      )}
      <text
        x="96"
        y="153"
        textAnchor="middle"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="3"
        fill="#C9A961"
      >
        CERTIFIED
      </text>
      <text
        x="96"
        y="171"
        textAnchor="middle"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontSize="8"
        letterSpacing="1.5"
        fill="#EDEBE6"
        opacity=".68"
      >
        PASSEPORT D'OEUVRE
      </text>
    </svg>
  );
}

export default VerifyBadge;
