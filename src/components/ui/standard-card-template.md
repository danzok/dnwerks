# Standard Card Template Guide

## Usage
This guide ensures consistent card styling across the entire application.

## Standard Card Structure

### Imports
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
```

### Grid Container (for metric cards)
```tsx
<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs *:data-[slot=card]:h-[200px] sm:grid-cols-2 lg:grid-cols-4">
```

### Card Template
```tsx
<Card className="@container/card flex flex-col" data-slot="card">
  <CardHeader className="flex-1">
    <CardDescription>Metric Name</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      Value
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <TrendingUp className="w-3 h-3" />
        +X%
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
```

## Key Classes to Use

### Grid Containers
- `*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card` - Gradient backgrounds
- `*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs` - Styling
- `*:data-[slot=card]:h-[200px]` - Consistent height
- `sm:grid-cols-2 lg:grid-cols-4` - Responsive columns

### Card Structure
- `@container/card flex flex-col` - Container query and flex layout
- `data-slot="card"` - Required for styling
- `flex-1` on CardHeader - Takes available space
- `mt-auto` on CardFooter - Pushes to bottom

### Typography
- `text-2xl font-semibold tabular-nums @[250px]/card:text-3xl` - Responsive titles
- `text-sm text-muted-foreground` - Consistent secondary text
- `line-clamp-1` - Truncate long text

### Icons & Badges
- `w-3 h-3` for badge icons
- `size-4` for footer icons
- `variant="outline"` for badges

## Spacing Standards
- `gap-4` for grid gaps
- `gap-1.5` for footer content
- `gap-2` for inline elements

## Color Palette
- Use `text-muted-foreground` for secondary text
- Use `TrendingUp`/`TrendingDown` with appropriate colors
- Use gradient backgrounds: `from-primary/5 to-card`