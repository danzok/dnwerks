# DNwerks UI Blocks

A collection of modern, reusable UI blocks built for shadcn/ui. These blocks feature responsive designs, modern styling patterns, and comprehensive functionality for dashboard and application interfaces.

## Available Blocks

### 📊 Analytics Dashboard (`analytics-dashboard-01`)
**A comprehensive analytics dashboard with metric cards, charts, and tables**

- ✅ Responsive metric cards with trending indicators
- ✅ Interactive charts (Line, Area, Bar, Composed)
- ✅ Data tables with status badges
- ✅ Loading states and skeletons
- ✅ Time range filtering and data export

```bash
npx shadcn-ui@latest add analytics-dashboard-01
```

### 📈 Metric Cards (`metric-cards-01`)
**Reusable metric cards with modern styling patterns**

- ✅ Container queries for responsive typography
- ✅ Gradient backgrounds and shadows
- ✅ Trending badges with icons
- ✅ Consistent 200px heights with flex layout
- ✅ Configurable metrics and styling

```bash
npx shadcn-ui@latest add metric-cards-01
```

### 🚀 Campaign Cards (`campaign-cards-01`)
**Interactive campaign management cards**

- ✅ Status tracking with visual indicators
- ✅ Progress bars for delivery rates
- ✅ Dropdown action menus
- ✅ Message preview with truncation
- ✅ Responsive grid layout

```bash
npx shadcn-ui@latest add campaign-cards-01
```

### 👥 Customer Cards (`customer-cards-01`)
**Customer contact management cards**

- ✅ Contact information display
- ✅ Status indicators and badges
- ✅ Smart date formatting
- ✅ Contact method detection
- ✅ Action menus for management

```bash
npx shadcn-ui@latest add customer-cards-01
```

## Design Principles

### 🎨 **Consistent Styling**
All blocks follow a standardized design system:
- **Gradient backgrounds**: `from-primary/5 to-card`
- **Consistent heights**: 200px for metric cards
- **Shadow effects**: `shadow-xs` for subtle depth
- **Border radius**: Following shadcn/ui standards

### 📱 **Responsive Design**
Modern responsive patterns:
- **Container queries**: Cards adapt to their container size
- **Breakpoint system**: Mobile-first responsive grid
- **Typography scaling**: Responsive text sizes with `@container` queries
- **Flexible layouts**: Flex and grid combinations

### ♿ **Accessibility**
Built with accessibility in mind:
- **Semantic HTML**: Proper heading hierarchy and structure
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **Color contrast**: WCAG compliant color combinations

### 🛠 **Developer Experience**
Easy to use and customize:
- **TypeScript**: Full type safety and IntelliSense
- **Composable**: Mix and match blocks and components
- **Customizable**: Easy theming and style overrides
- **Well documented**: Comprehensive docs and examples

## Standard Card Template

All blocks follow a consistent card template pattern:

```tsx
<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs *:data-[slot=card]:h-[200px] sm:grid-cols-2 lg:grid-cols-4">
  <Card className="@container/card flex flex-col" data-slot="card">
    <CardHeader className="flex-1">
      <CardDescription>Label</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        Value
      </CardTitle>
      <CardAction>
        <Badge variant="outline">
          <TrendingUp className="w-3 h-3" />
          Status
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
      <div className="line-clamp-1 flex gap-2 font-medium">
        Message <Icon className="size-4" />
      </div>
      <div className="text-muted-foreground">
        Context
      </div>
    </CardFooter>
  </Card>
</div>
```

## Usage Patterns

### Basic Implementation
```tsx
import { MetricCards } from "@/components/blocks/metric-cards-01";

const metrics = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "Monthly revenue",
    trend: { value: 12.5, isPositive: true, label: "vs last month" },
    status: { message: "Strong performance", context: "Exceeding targets" }
  }
];

export default function Dashboard() {
  return <MetricCards metrics={metrics} />;
}
```

### Advanced Usage
```tsx
import { AnalyticsDashboard } from "@/components/blocks/analytics-dashboard-01";
import { CampaignCards } from "@/components/blocks/campaign-cards-01";

export default function AdvancedDashboard() {
  return (
    <div className="space-y-8">
      <AnalyticsDashboard />
      <CampaignCards 
        campaigns={campaigns}
        onEdit={handleEdit}
        onSend={handleSend}
      />
    </div>
  );
}
```

## Contributing

These blocks were created following the [shadcn/ui blocks contribution guidelines](https://ui.shadcn.com/blocks#guidelines):

1. ✅ **Proper imports**: Uses `@/registry/new-york/` paths
2. ✅ **Registry schema**: Complete block definitions
3. ✅ **Dependencies**: All registryDependencies and dependencies listed
4. ✅ **Categories**: Proper categorization for discovery
5. ✅ **Documentation**: Comprehensive READMEs and examples

## License

MIT License - Free for personal and commercial use.

## Credits

Created by [DNwerks](https://github.com/dnwerks) for the shadcn/ui community.