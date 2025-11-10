export function CampaignListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Filters Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg animate-pulse w-10 h-10" />
              <div className="ml-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mb-1" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 mb-4 border-b">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-20" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Message Preview */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2" />
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-8" />
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mb-1" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-8" />
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                </div>
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <div className="h-9 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-9 bg-gray-200 rounded animate-pulse w-16" />
              </div>

              {/* Date */}
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24 pt-2 border-t" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}