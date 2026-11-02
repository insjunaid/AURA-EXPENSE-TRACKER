/** Page title block: large serif title on the left, actions on the right. */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-[40px] sm:text-[44px] leading-[0.95] tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
