// Literal colour values for Chart.js (which can't read CSS variables).
// Mirrors the tokens in index.css.
export function chartTheme(isDark) {
  return isDark
    ? {
        ink: '#f4f4f2', income: '#4adea0', expense: '#fb7185', savings: '#a8a8ae',
        grid: 'rgba(255,255,255,0.07)', tick: '#74747c', surface: '#131315',
        tooltipBg: '#f4f4f2', tooltipFg: '#0c0c0d',
      }
    : {
        ink: '#0c0c0d', income: '#047857', expense: '#cf264a', savings: '#8a8a90',
        grid: 'rgba(0,0,0,0.06)', tick: '#808086', surface: '#ffffff',
        tooltipBg: '#0c0c0d', tooltipFg: '#f7f7f5',
      };
}

export function baseTooltip(t) {
  return {
    backgroundColor: t.tooltipBg,
    titleColor: t.tooltipFg,
    bodyColor: t.tooltipFg,
    titleFont: { family: 'Geist', weight: '600', size: 12 },
    bodyFont: { family: 'Geist', size: 12 },
    padding: 10,
    cornerRadius: 10,
    boxPadding: 4,
    usePointStyle: true,
  };
}
