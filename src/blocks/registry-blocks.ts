// Complete registry for all DNwerks blocks
// This file would be added to or merged with the main shadcn/ui registry

export const blocks = [
  {
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
  },
  {
    name: "metric-cards-01",
    author: "DNwerks (https://github.com/dnwerks)",
    title: "Metric Cards with Trending Indicators",
    description: "Reusable metric cards with responsive design, trending badges, gradient backgrounds, and container queries. Perfect for dashboards and analytics interfaces.",
    type: "registry:block",
    registryDependencies: [
      "card",
      "badge"
    ],
    dependencies: [
      "lucide-react"
    ],
    files: [
      {
        path: "blocks/metric-cards-01/components/metric-cards.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "analytics"],
  },
  {
    name: "campaign-cards-01",
    author: "DNwerks (https://github.com/dnwerks)",
    title: "Campaign Management Cards",
    description: "Interactive campaign cards with status tracking, progress indicators, and action menus. Features responsive design, dropdown actions, and delivery rate visualization.",
    type: "registry:block",
    registryDependencies: [
      "card",
      "badge",
      "button", 
      "progress",
      "dropdown-menu"
    ],
    dependencies: [
      "lucide-react"
    ],
    files: [
      {
        path: "blocks/campaign-cards-01/components/campaign-cards.tsx",
        type: "registry:component",
      },
    ],
    categories: ["marketing", "dashboard"],
  },
  {
    name: "customer-cards-01",
    author: "DNwerks (https://github.com/dnwerks)",
    title: "Customer Management Cards",
    description: "Customer contact cards with status indicators, contact information display, and action menus. Features responsive grid layout and contact method visualization.",
    type: "registry:block",
    registryDependencies: [
      "card",
      "badge",
      "button",
      "dropdown-menu"
    ],
    dependencies: [
      "lucide-react"
    ],
    files: [
      {
        path: "blocks/customer-cards-01/components/customer-cards.tsx",
        type: "registry:component",
      },
    ],
    categories: ["crm", "dashboard"],
  },
];