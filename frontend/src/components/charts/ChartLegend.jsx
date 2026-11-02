export default function ChartLegend({ items }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
