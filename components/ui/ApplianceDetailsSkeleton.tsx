'use client';

/**
 * Skeleton loader for Appliance Details Page
 * Displays a smooth animated placeholder while loading appliance details
 */
export function ApplianceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-48" dir="rtl">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex-1"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Image Skeleton */}
      <div className="relative h-80 bg-gray-200 animate-pulse">
        {/* Badge Skeleton */}
        <div className="absolute top-4 left-4 bg-gray-300 rounded-full h-8 w-24"></div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 py-6 space-y-6">
        {/* Title and Brand */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-5 w-px bg-gray-200"></div>
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Color Skeleton */}
        <div className="pb-6 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        {/* Description Skeleton */}
        <div className="pb-6 border-b border-gray-100 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>

        {/* Rental Prices Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar Skeleton */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-50">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Shimmer effect */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #e5e7eb 50%,
            #f3f4f6 75%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
