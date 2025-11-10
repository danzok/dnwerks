export function CampaignFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-13">
        {/* Main form skeleton */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Campaign details skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Message composer skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Recipients skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Send options skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Campaign summary skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-3">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Tips skeleton */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-200 rounded-full mt-2"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-200 rounded-full mt-2"></div>
                  <div className="h-3 w-44 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-200 rounded-full mt-2"></div>
                  <div className="h-3 w-52 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-200 rounded-full mt-2"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}