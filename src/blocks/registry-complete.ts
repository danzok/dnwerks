// Complete registry for all DNwerks UI components
// This file contains the comprehensive component library registry

export const completeRegistry = {
  // Main component blocks
  blocks: [
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
      categories: ["dashboard", "analytics"],
      tags: ["dashboard", "metrics", "charts", "responsive", "analytics", "visualization"],
      featured: true,
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
      tags: ["metrics", "cards", "responsive", "indicators", "trending"],
      featured: true,
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
      tags: ["campaigns", "status", "progress", "actions", "management"],
      featured: false,
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
      tags: ["customers", "contacts", "status", "management", "crm"],
      featured: false,
    },
  ],

  // Individual components
  components: [
    {
      name: "campaign-metrics-chart",
      title: "Campaign Metrics Chart",
      description: "Line chart component specifically designed for campaign performance visualization with responsive design and custom theming.",
      type: "registry:component",
      registryDependencies: [],
      dependencies: ["recharts"],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/campaign-metrics-chart.tsx",
          type: "registry:component",
        },
      ],
      categories: ["charts"],
      tags: ["charts", "campaigns", "metrics", "visualization", "line-chart"],
    },
    {
      name: "delivery-metrics-chart",
      title: "Delivery Metrics Chart", 
      description: "Area chart component for delivery rate tracking with percentage visualization and performance indicators.",
      type: "registry:component",
      registryDependencies: [],
      dependencies: ["recharts"],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/delivery-metrics-chart.tsx",
          type: "registry:component",
        },
      ],
      categories: ["charts"],
      tags: ["charts", "delivery", "rates", "performance", "area-chart"],
    },
    {
      name: "customer-engagement-chart",
      title: "Customer Engagement Chart",
      description: "Bar chart component for visualizing customer engagement metrics with customizable styling and data formatting.",
      type: "registry:component", 
      registryDependencies: [],
      dependencies: ["recharts"],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/customer-engagement-chart.tsx",
          type: "registry:component",
        },
      ],
      categories: ["charts"],
      tags: ["charts", "engagement", "customers", "metrics", "bar-chart"],
    },
    {
      name: "cost-analysis-chart",
      title: "Cost Analysis Chart",
      description: "Composed chart component combining line and area charts for comprehensive cost analysis visualization.",
      type: "registry:component",
      registryDependencies: [],
      dependencies: ["recharts"],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/cost-analysis-chart.tsx",
          type: "registry:component",
        },
      ],
      categories: ["charts"],
      tags: ["charts", "costs", "analysis", "composite", "visualization"],
    },
    {
      name: "analytics-table",
      title: "Analytics Data Table",
      description: "Reusable data table component with status badges, sorting capabilities, and responsive design for analytics data.",
      type: "registry:component",
      registryDependencies: ["table", "badge"],
      dependencies: [],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/analytics-table.tsx",
          type: "registry:component",
        },
      ],
      categories: ["analytics", "data"],
      tags: ["table", "data", "analytics", "sorting", "badges"],
    },
    {
      name: "analytics-skeleton",
      title: "Analytics Loading Skeleton",
      description: "Loading skeleton component specifically designed for analytics dashboards with proper spacing and component placeholders.",
      type: "registry:component", 
      registryDependencies: ["skeleton", "card"],
      dependencies: [],
      files: [
        {
          path: "blocks/analytics-dashboard-01/components/analytics-skeleton.tsx",
          type: "registry:component",
        },
      ],
      categories: ["ui", "loading"],
      tags: ["skeleton", "loading", "placeholder", "analytics"],
    },
  ],

  // Hooks
  hooks: [
    {
      name: "use-analytics",
      title: "Analytics Data Hook",
      description: "Custom React hook for fetching and managing analytics data with loading states and error handling.",
      type: "registry:hook",
      registryDependencies: [],
      dependencies: [],
      files: [
        {
          path: "blocks/analytics-dashboard-01/hooks/use-analytics.ts",
          type: "registry:hook",
        },
      ],
      categories: ["hooks", "analytics"],
      tags: ["hook", "analytics", "data", "state-management"],
    },
  ],

  // Themes and utilities
  themes: [
    {
      name: "theme-showcase",
      title: "Theme Showcase Component",
      description: "Complete theme demonstration component showing all available colors, styling patterns, and component variations.",
      type: "registry:component",
      registryDependencies: ["card", "badge", "button"],
      dependencies: ["lucide-react"],
      files: [
        {
          path: "blocks/theme-showcase/page.tsx",
          type: "registry:page",
          target: "app/theme-showcase/page.tsx",
        },
      ],
      categories: ["ui", "theming"],
      tags: ["theme", "colors", "showcase", "patterns", "styling"],
    },
  ],

  // Categories for organization
  categories: [
    {
      name: "dashboard",
      slug: "dashboard",
      description: "Dashboard components for displaying metrics and data",
      hidden: false,
    },
    {
      name: "analytics", 
      slug: "analytics",
      description: "Analytics and data visualization components",
      hidden: false,
    },
    {
      name: "marketing",
      slug: "marketing", 
      description: "Marketing and campaign management components",
      hidden: false,
    },
    {
      name: "crm",
      slug: "crm",
      description: "Customer relationship management components", 
      hidden: false,
    },
    {
      name: "charts",
      slug: "charts",
      description: "Chart and data visualization components",
      hidden: false,
    },
    {
      name: "ui",
      slug: "ui",
      description: "General UI components and utilities",
      hidden: false,
    },
    {
      name: "hooks",
      slug: "hooks", 
      description: "React hooks for state management and data fetching",
      hidden: false,
    },
    {
      name: "theming",
      slug: "theming",
      description: "Theme and styling related components",
      hidden: false,
    },
  ],

  // Installation and setup information
  setup: {
    requirements: [
      "React 18+",
      "Next.js 13+ (App Router)",
      "Tailwind CSS 3.3+",
      "@radix-ui primitives",
      "shadcn/ui base components"
    ],
    installation: {
      cli: "npx shadcn-ui@latest init",
      manual: "Follow the shadcn/ui installation guide"
    },
    configuration: {
      tailwind: "Ensure CSS variables are enabled",
      components: "Add @/components and @/lib path aliases"
    }
  }
};

// Export individual sections for easier access
export const { blocks, components, hooks, themes, categories, setup } = completeRegistry;