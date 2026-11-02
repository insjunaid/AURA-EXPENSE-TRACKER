import { useEffect, useRef, useState } from 'react';
import { currencySymbol, formatNumber } from '../../lib/format';

/** Smoothly counts up to `value` (eased, ~700ms) — respects reduced motion. */
export function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduce || from === value) { setDisplay(value); fromRef.current = value; return; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); fromRef.current = value; };
  }, [value, duration]);

  return display;
}

/**
 * Money with a de-emphasised currency symbol and decimals:
 *   ₹ 1,24,500.50  →  symbol + whole part + faded ".50"
 */
export default function Money({ value = 0, currency = 'INR', animate = false, sign, className = '', symbolClassName = '', decimalsClassName = 'opacity-50' }) {
  const animated = useCountUp(value);
  const v = animate ? animated : value;
  const abs = Math.abs(v);
  const whole = formatNumber(Math.trunc(abs), currency, { decimals: 0 });
  const cents = Math.round((abs - Math.trunc(abs)) * 100);
  const neg = value < 0;
  const prefix = sign ?? (neg ? '−' : '');

  return (
    <span className={`tabular whitespace-nowrap ${className}`}>
      {prefix}
      <span className={symbolClassName}>{currencySymbol(currency)}</span>
      {whole}
      {cents > 0 && !animate && <span className={decimalsClassName}>.{String(cents).padStart(2, '0')}</span>}
    </span>
  );
}
