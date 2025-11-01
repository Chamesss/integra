import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component for variations
export default function VariationsLoadingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Header Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-12 h-3" />
            </div>
            <Skeleton className="w-8 h-6" />
          </div>
        ))}
      </div>

      {/* Actions Skeleton */}
      <div className="flex flex-col bg-white sm:flex-row border border-gray-200 rounded-lg p-4 sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-40 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-32 h-8" />
        </div>
      </div>

      {/* Variation Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6"
          >
            <div className="space-y-4">
              {/* Status and attributes skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-16 h-5" />
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-24 h-6" />
                </div>
              </div>

              {/* Details grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, detailIndex) => (
                  <div key={detailIndex} className="space-y-2">
                    <Skeleton className="w-16 h-3 bg" />
                    <Skeleton className="w-full h-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
