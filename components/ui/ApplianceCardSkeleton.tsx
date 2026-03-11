'use client';

/**
 * Skeleton loader for ApplianceCard
 * Displays a smooth animated placeholder while loading
 */
export function ApplianceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 bg-gray-200">
        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 bg-gray-300 rounded-full h-6 w-20"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>

        {/* Model Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>

        {/* Brand and Color Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 w-1 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Price Skeleton */}
        <div className="pt-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards for the appliances list page
 */
export function ApplianceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ApplianceCardSkeleton key={index} />
      ))}
    </div>
  );
}
