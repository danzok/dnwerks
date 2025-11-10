# DNwerks UI Components

A comprehensive component library built for shadcn/ui, featuring modern SMS campaign dashboard components with responsive design, accessibility, and beautiful theming.

## 🚀 Quick Start

```bash
# Install a specific component
npx shadcn-ui@latest add analytics-dashboard-01

# Or browse all components
npm run dev
# Visit http://localhost:3000/components
```

## 📦 Available Components

### 📊 Dashboard Components

#### Analytics Dashboard (`analytics-dashboard-01`)
Complete analytics dashboard with metric cards, charts, and tables.

```tsx
import { AnalyticsDashboard } from "@/components/blocks/analytics-dashboard-01";

export default function Page() {
  return <AnalyticsDashboard />;
}
```

**Features:**
- Responsive metric cards with trending indicators
- Interactive charts (Line, Area, Bar, Composed)
- Data tables with status badges
- Time range filtering and data export
- Loading states with skeleton components

#### Metric Cards (`metric-cards-01`)
Reusable metric cards with modern styling patterns.

```tsx
import { MetricCards } from "@/components/blocks/metric-cards-01";

const metrics = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "Monthly revenue",
    trend: { value: 12.5, isPositive: true },
    status: { message: "Strong performance", context: "Exceeding targets" }
  }
];

export default function Page() {
  return <MetricCards metrics={metrics} />;
}
```

**Features:**
- Container queries for responsive typography
- Gradient backgrounds with theme integration
- Trending badges with icons
- Consistent 220px heights with flex layout

### 🚀 Marketing Components

#### Campaign Cards (`campaign-cards-01`)
Interactive campaign management cards.

```tsx
import { CampaignCards } from "@/components/blocks/campaign-cards-01";

export default function Page() {
  return (
    <CampaignCards 
      campaigns={campaigns}
      onEdit={handleEdit}
      onSend={handleSend}
      onDelete={handleDelete}
    />
  );
}
```

**Features:**
- Status tracking with visual indicators
- Progress bars for delivery rates
- Dropdown action menus
- Message preview with smart truncation

### 👥 CRM Components

#### Customer Cards (`customer-cards-01`)
Customer contact management cards.

```tsx
import { CustomerCards } from "@/components/blocks/customer-cards-01";

export default function Page() {
  return (
    <CustomerCards 
      customers={customers}
      onEdit={handleEdit}
      onContact={handleContact}
      onDelete={handleDelete}
    />
  );
}
```

**Features:**
- Smart phone number formatting
- Relative date display (Today, Yesterday, etc.)
- Contact method detection
- Status indicators with theming

### 📈 Chart Components

All chart components are built with Recharts and include:

- **CampaignMetricsChart** - Line chart for campaign performance
- **DeliveryMetricsChart** - Area chart for delivery rates  
- **CustomerEngagementChart** - Bar chart for engagement metrics
- **CostAnalysisChart** - Composed chart for cost analysis

```tsx
import { CampaignMetricsChart } from "@/components/blocks/analytics-dashboard-01";

export default function Page() {
  return <CampaignMetricsChart data={chartData} />;
}
```

### 🎨 Theme Components

#### Theme Showcase (`theme-showcase`)
Complete theme demonstration component.

```tsx
import ThemeShowcase from "@/components/blocks/theme-showcase";

export default function Page() {
  return <ThemeShowcase />;
}
```

## 🎨 Theming

All components use a sophisticated theming system based on OKLCH colors:

```css
:root {
  --primary: oklch(0.488 0.243 264.376);
  --campaign-success: oklch(0.7 0.15 155);
  --campaign-warning: oklch(0.84 0.16 84);
  --campaign-pending: oklch(0.75 0.12 260);
}
```

### Custom Campaign Colors

```tsx
<Badge className="bg-campaign-success text-campaign-success-foreground">
  Completed
</Badge>
```

## 📱 Responsive Design

All components feature:

- **Container queries** for responsive typography
- **Mobile-first** breakpoints (sm:, lg:, xl:)
- **Flexible grids** (1-4 columns based on screen size)
- **Touch-friendly** interactions

## ♿ Accessibility

Components follow WCAG guidelines:

- **Proper contrast ratios** in light and dark modes
- **Semantic HTML** with correct heading hierarchy
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** with visible focus rings

## 🛠 Development

### Requirements

- React 18+
- Next.js 13+ (App Router)
- Tailwind CSS 3.3+
- shadcn/ui base components

### Installation

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install base components
npx shadcn-ui@latest add card badge button

# Install our components
npx shadcn-ui@latest add analytics-dashboard-01
```

### Configuration

Ensure your `tailwind.config.js` includes:

```js
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "campaign-success": "var(--campaign-success)",
        "campaign-warning": "var(--campaign-warning)",
        "campaign-pending": "var(--campaign-pending)",
      }
    }
  }
}
```

## 📚 Examples

### Basic Dashboard

```tsx
import { MetricCards } from "@/components/blocks/metric-cards-01";
import { CampaignCards } from "@/components/blocks/campaign-cards-01";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <MetricCards metrics={metrics} />
      <CampaignCards campaigns={campaigns} />
    </div>
  );
}
```

### Complete Analytics

```tsx
import { AnalyticsDashboard } from "@/components/blocks/analytics-dashboard-01";

export default function Analytics() {
  return <AnalyticsDashboard />;
}
```

## 🤝 Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

### Submitting Components

1. Fork the repository
2. Create your component following our standards
3. Add proper documentation and examples
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

Built with ❤️ by [DNwerks](https://github.com/dnwerks) for the shadcn/ui community.

- **shadcn/ui** - Base component library
- **Radix UI** - Accessible primitives
- **Recharts** - Chart library
- **Lucide React** - Icon library