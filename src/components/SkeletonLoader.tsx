'use client';

interface SkeletonLoaderProps {
  variant?: 'card' | 'metric' | 'text' | 'circle' | 'list';
  className?: string;
  count?: number;
}

export function SkeletonLoader({ variant = 'card', className = '', count = 1 }: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-slate-700 rounded';

  const variants = {
    card: 'h-32 w-full',
    metric: 'h-24 w-full',
    text: 'h-4 w-full',
    circle: 'h-12 w-12 rounded-full',
    list: 'h-16 w-full',
  };

  if (count > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} ${variants[variant]}`} />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-slate-600 animate-pulse" />
      </div>
      <div className="h-8 w-16 bg-gray-300 dark:bg-slate-600 rounded mb-2 animate-pulse" />
      <div className="h-4 w-24 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-20 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
        <div className="h-3 w-3 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
        <div className="h-5 w-16 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
      </div>
      <div className="h-5 w-full bg-gray-300 dark:bg-slate-600 rounded mb-2 animate-pulse" />
      <div className="h-4 w-32 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
    </div>
  );
}
