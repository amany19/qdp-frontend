export function PropertyCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <div className={`animate-shimmer ${compact ? 'h-40' : 'h-48'}`}></div>

      {/* Content skeleton */}
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Title skeleton */}
        <div className={`animate-shimmer rounded ${compact ? 'h-5 mb-2' : 'h-6 mb-3'}`}></div>

        {/* Location skeleton */}
        <div className={`animate-shimmer rounded w-2/3 ${compact ? 'h-3 mb-2' : 'h-4 mb-3'}`}></div>

        {/* Specifications skeleton */}
        <div className={`flex gap-4 ${compact ? 'mb-2' : 'mb-3'}`}>
          <div className={`animate-shimmer rounded ${compact ? 'h-3 w-8' : 'h-4 w-10'}`}></div>
          <div className={`animate-shimmer rounded ${compact ? 'h-3 w-8' : 'h-4 w-10'}`}></div>
          <div className={`animate-shimmer rounded ${compact ? 'h-3 w-12' : 'h-4 w-16'}`}></div>
        </div>

        {/* Price skeleton */}
        <div className={`animate-shimmer rounded w-1/2 ${compact ? 'h-5' : 'h-6'}`}></div>
      </div>
    </div>
  );
}
