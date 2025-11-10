// Registry definition for the metric cards block
// This would be added to the main registry-blocks.ts file

export const metricCardsBlock = {
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
};