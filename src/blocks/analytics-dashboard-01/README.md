# Analytics Dashboard Block

A comprehensive analytics dashboard featuring modern metric cards with trending indicators, responsive charts, and data tables.

## Features

- **📊 Metric Cards**: Responsive cards with trending badges, gradient backgrounds, and container queries
- **📈 Interactive Charts**: Multiple chart types using Recharts (Line, Area, Bar, Composed)
- **📋 Data Tables**: Sortable tables with status badges and pagination
- **🔄 Loading States**: Skeleton components for smooth loading experiences
- **📱 Responsive Design**: Adaptive layout for mobile, tablet, and desktop
- **🎨 Modern Styling**: Gradient backgrounds, shadows, and consistent spacing
- **♿ Accessible**: Proper ARIA labels and semantic HTML

## Components Included

### Core Components
- `AnalyticsDashboard` - Main dashboard component
- `AnalyticsSkeleton` - Loading state component

### Chart Components
- `CampaignMetricsChart` - Line chart for campaign performance
- `DeliveryMetricsChart` - Area chart for delivery rates
- `CustomerEngagementChart` - Bar chart for engagement metrics
- `CostAnalysisChart` - Composed chart for cost analysis

### Data Components
- `AnalyticsTable` - Reusable data table with badges

### Hooks
- `useAnalytics` - Custom hook for fetching and managing analytics data

## Installation

```bash
npx shadcn-ui@latest add analytics-dashboard-01
```

## Usage

```tsx
import { AnalyticsDashboard } from "@/components/blocks/analytics-dashboard-01/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <AnalyticsDashboard />
    </div>
  );
}
```

## Card Template Pattern

The metric cards follow a standardized pattern that can be reused:

```tsx
<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs *:data-[slot=card]:h-[200px] sm:grid-cols-2 lg:grid-cols-4">
  <Card className="@container/card flex flex-col" data-slot="card">
    <CardHeader className="flex-1">
      <CardDescription>Metric Name</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        Value
      </CardTitle>
      <CardAction>
        <Badge variant="outline">
          <TrendingUp className="w-3 h-3" />
          +12.5%
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
      <div className="line-clamp-1 flex gap-2 font-medium">
        Status message <TrendingUp className="size-4" />
      </div>
      <div className="text-muted-foreground">
        Additional context
      </div>
    </CardFooter>
  </Card>
</div>
```

## Key Features

### Responsive Grid
- **Mobile**: 1 column
- **Tablet**: 2 columns  
- **Desktop**: 4 columns
- **Container Queries**: Cards adapt to their container size

### Metric Card Structure
- **CardDescription**: Metric label
- **CardTitle**: Main value with responsive typography
- **CardAction**: Trending badge with icon
- **CardFooter**: Status message and context

### Styling Standards
- **Heights**: Fixed 200px for consistent alignment
- **Spacing**: Standardized gaps and padding
- **Typography**: Tabular numbers and proper hierarchy
- **Colors**: Gradient backgrounds with CSS custom properties

## Customization

### Changing Colors
Modify the gradient backgrounds by updating the CSS custom properties:

```css
--chart-1: 217 91% 60%;
--chart-2: 142 69% 58%;
--chart-3: 262 83% 65%;
--chart-4: 44 96% 68%;
--chart-5: 12 76% 61%;
```

### Adding New Metrics
Extend the `AnalyticsMetrics` interface and add new cards following the pattern:

```tsx
interface AnalyticsMetrics {
  // Existing metrics...
  newMetric: number;
}
```

## Dependencies

- **recharts**: Charts and data visualization
- **lucide-react**: Icons and visual elements
- **@radix-ui**: Underlying UI primitives

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use in personal and commercial projects.