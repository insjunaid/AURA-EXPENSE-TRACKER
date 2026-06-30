export default function SuggestionCard({ suggestion }) {
  const typeStyles = {
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: '⚠️',
      titleColor: 'text-amber-700 dark:text-amber-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: '💡',
      titleColor: 'text-blue-700 dark:text-blue-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: '✅',
      titleColor: 'text-emerald-700 dark:text-emerald-400',
    },
  };

  const style = typeStyles[suggestion.type] || typeStyles.info;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${style.titleColor} mb-1`}>
            {suggestion.title}
          </h4>
          <p className="text-sm text-dark-600 dark:text-dark-300">
            {suggestion.message}
          </p>
          {suggestion.potential_savings > 0 && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              💰 Potential savings: ₹{suggestion.potential_savings.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
