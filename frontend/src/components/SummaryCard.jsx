import { useEffect, useRef, useState } from 'react';

export default function SummaryCard({ title, amount, icon, trend, color = 'primary', currency = '₹', delay = 0 }) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const cardRef = useRef(null);

  // Animated counter
  useEffect(() => {
    const target = Math.abs(amount);
    if (target === 0) { setDisplayAmount(0); return; }

    const duration = 1000;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(target, increment * step);
      setDisplayAmount(Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [amount]);

  const gradients = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgGradients = {
    primary: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    green: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
  };

  return (
    <div
      ref={cardRef}
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`badge ${trend >= 0
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-dark-900 dark:text-white">
        {amount < 0 ? '-' : ''}{currency}{displayAmount.toLocaleString('en-IN')}
      </p>

      {/* Subtle gradient strip at bottom */}
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${gradients[color]} opacity-30`} />
    </div>
  );
}
