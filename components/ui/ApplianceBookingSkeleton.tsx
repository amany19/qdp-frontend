'use client';

/**
 * Skeleton loader for Appliance Booking Page
 * Displays a smooth animated placeholder while loading booking form
 */
export function ApplianceBookingSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-56" dir="rtl">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Appliance Summary Skeleton */}
        <div className="p-5 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Rental Duration Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Date Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Time Slots Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="py-3 rounded-lg border-2 border-gray-200 bg-white">
                <div className="h-5 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-24 bg-gray-50 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Fixed Bottom Bar Skeleton */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
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
