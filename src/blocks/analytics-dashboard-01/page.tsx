import { Suspense } from "react";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { AnalyticsSkeleton } from "./components/analytics-skeleton";

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDashboard />
        </Suspense>
      </div>
    </div>
  );
}