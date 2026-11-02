/**
 * Aura mark — a monogram "A" whose crossbar is a rising line, set in a
 * rounded square. Inherits colour from the current theme.
 */
export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" className="fill-ink" />
      <path
        d="M19 47 L32 16 L45 47"
        fill="none"
        className="stroke-canvas"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M23.8 37.5 L29.5 33 L33.5 35.6 L38.1 31.2" fill="none" className="stroke-canvas" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

export default function Logo({ size = 36, showText = true, subtitle = 'Wealth Manager' }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      {showText && (
        <div className="leading-none">
          <p className="font-display text-[26px] leading-none tracking-tight text-ink">Aura</p>
          {subtitle && <p className="eyebrow mt-1 !text-[9.5px]">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
