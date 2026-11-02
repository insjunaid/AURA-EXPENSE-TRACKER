export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="card p-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-56 rounded-[28px]" />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      <Skeleton className="h-72 rounded-3xl" />
      <ListSkeleton rows={4} />
    </div>
  );
}
