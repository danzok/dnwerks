// Registry definition for the analytics dashboard block
// This would be added to the main registry-blocks.ts file

export const analyticsCardsDashboardBlock = {
  name: "analytics-dashboard-01",
  author: "DNwerks (https://github.com/dnwerks)",
  title: "Analytics Dashboard with Metric Cards",
  description: "A comprehensive analytics dashboard featuring metric cards with trending indicators, responsive charts, and data tables. Built with modern card patterns using container queries and gradient backgrounds.",
  type: "registry:block",
  registryDependencies: [
    "card",
    "badge", 
    "button",
    "tabs",
    "select",
    "table",
    "skeleton"
  ],
  dependencies: [
    "recharts",
    "lucide-react"
  ],
  files: [
    {
      path: "blocks/analytics-dashboard-01/page.tsx",
      type: "registry:page",
      target: "app/analytics/page.tsx",
    },
    {
      path: "blocks/analytics-dashboard-01/components/analytics-dashboard.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/analytics-skeleton.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/campaign-metrics-chart.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/delivery-metrics-chart.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/customer-engagement-chart.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/cost-analysis-chart.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/components/analytics-table.tsx",
      type: "registry:component",
    },
    {
      path: "blocks/analytics-dashboard-01/hooks/use-analytics.ts",
      type: "registry:hook",
    },
  ],
  categories: ["dashboard"],
};