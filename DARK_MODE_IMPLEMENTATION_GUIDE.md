# Dark Mode Implementation Guide

## 🌙 Overview

This guide provides comprehensive instructions for implementing dark mode across all pages in the DNwerks application using `next-themes` and shadcn/ui components.

## ✅ Current Implementation Status

### **Infrastructure** ✅ Complete
- **next-themes**: Installed and configured (`^0.4.6`)
- **Theme Provider**: Implemented in `src/components/theme-provider.tsx`
- **Root Layout**: Configured with proper theme settings
- **Mode Toggle**: Available with client-side hydration safety
- **Tailwind Config**: Dark mode enabled with `darkMode: ["class"]`

### **Components** ✅ Complete
- **Mode Toggle**: `src/components/mode-toggle.tsx`
- **Client Safe Toggle**: `src/components/client-safe-mode-toggle.tsx`
- **Dark Mode Toast**: `src/components/ui/sonner.tsx`
- **Enhanced Badge**: `src/components/ui/enhanced-badge.tsx`
- **Data Table**: `src/components/data-table.tsx`

### **Pages** 🔄 Partially Complete

#### ✅ **Pages WITH Dark Mode Support**:
- `/` (Landing) - Dark mode compatible
- `/dashboard` - Full dark mode implementation
- `/enhanced-demo` - Complete theme support
- `/test-neutral` - Dark mode testing page
- `/showcase/templates` - Theme demonstration

#### ⚠️ **Pages NEEDING Dark Mode Implementation**:
- `/campaigns` - Campaign management
- `/contacts` - Contact management
- `/login` - Authentication page
- `/admin` - Admin dashboard
- `/campaigns/create` - Campaign creation
- `/campaigns/[id]/edit` - Campaign editing
- `/admin/users` - User management
- `/admin/settings` - Admin settings

## 🛠️ Implementation Instructions

### **Step 1: Add Dark Mode to Pages**

For each page that needs dark mode support, update the main container and components:

```tsx
// Before (Light Mode Only)
export default function PageName() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container section-spacing">
        <Card className="bg-white border-gray-200">
          <h1 className="text-gray-900">Title</h1>
          <p className="text-gray-600">Description</p>
        </Card>
      </div>
    </div>
  )
}

// After (Dark Mode Support)
export default function PageName() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="page-container section-spacing">
        <Card className="bg-white dark:bg-card border-gray-200 dark:border-border">
          <h1 className="text-gray-900 dark:text-foreground">Title</h1>
          <p className="text-gray-600 dark:text-muted-foreground">Description</p>
        </Card>
      </div>
    </div>
  )
}
```

### **Step 2: Dark Mode Class Reference**

#### **Background Classes**:
```tsx
// Page backgrounds
bg-gray-50 dark:bg-gray-900          // Light gray to dark gray
bg-white dark:bg-background         // White to card background
bg-gray-100 dark:bg-gray-800        // Light to medium dark

// Component backgrounds  
bg-white dark:bg-card              // Cards, panels
bg-gray-50 dark:bg-gray-800/50     // Subtle sections
bg-blue-50 dark:bg-blue-900/20     // Colored sections
bg-green-50 dark:bg-green-900/20   // Success sections
```

#### **Text Classes**:
```tsx
// Primary text
text-gray-900 dark:text-foreground    // Headings, important text
text-gray-700 dark:text-foreground    // Secondary headings
text-gray-600 dark:text-muted-foreground // Body text
text-gray-500 dark:text-muted-foreground // Light text

// Colored text
text-blue-600 dark:text-blue-400     // Links, primary actions
text-green-600 dark:text-green-400   // Success states
text-red-600 dark:text-red-400       // Error states
text-orange-600 dark:text-orange-400 // Warnings
text-purple-600 dark:text-purple-400 // Features
```

#### **Border Classes**:
```tsx
border-gray-200 dark:border-border     // Standard borders
border-gray-300 dark:border-border     // Heavier borders
border-blue-200 dark:border-blue-800   // Blue accents
border-green-200 dark:border-green-800 // Green accents
```

### **Step 3: Specific Component Patterns**

#### **Cards**:
```tsx
<Card className="bg-white dark:bg-card border-gray-200 dark:border-border shadow-sm">
  <CardHeader>
    <CardTitle className="text-gray-900 dark:text-foreground">
      Title
    </CardTitle>
    <CardDescription className="text-gray-600 dark:text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### **Buttons**:
```tsx
// Primary button (shadcn/ui handles dark mode automatically)
<Button variant="default">Action</Button>

// Secondary button
<Button variant="outline" className="border-gray-300 dark:border-border">
  Secondary
</Button>

// Ghost button
<Button variant="ghost">Ghost</Button>
```

#### **Icons with Backgrounds**:
```tsx
<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
  <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
</div>

<div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
</div>
```

#### **Status Badges**:
```tsx
<Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
  Active
</Badge>

<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
  Pending
</Badge>
```

#### **Form Elements**:
```tsx
<Input 
  placeholder="Enter text"
  className="bg-white dark:bg-background border-gray-300 dark:border-border"
/>

<Select>
  <SelectTrigger className="bg-white dark:bg-background border-gray-300 dark:border-border">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {/* Options */}
  </SelectContent>
</Select>
```

#### **Tables**:
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-gray-200 dark:border-border">
      <TableHead className="text-gray-900 dark:text-foreground">Name</TableHead>
      <TableHead className="text-gray-900 dark:text-foreground">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-gray-200 dark:border-border">
      <TableCell className="text-gray-700 dark:text-muted-foreground">
        John Doe
      </TableCell>
      <TableCell>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
          Active
        </Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### **Step 4: Testing Dark Mode**

#### **Manual Testing Checklist**:
1. **Theme Toggle**: Test light, dark, and system preferences
2. **Contrast**: Ensure text is readable in both modes
3. **Colors**: Verify status colors work properly
4. **Transitions**: Check smooth theme switching
5. **Persistence**: Confirm theme preference is saved
6. **Mobile**: Test on mobile devices

#### **Automated Testing**:
```tsx
// Example test for dark mode
import { render } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

test('component renders in dark mode', () => {
  render(
    <ThemeProvider attribute="class" defaultTheme="dark">
      <YourComponent />
    </ThemeProvider>
  )
  
  // Test dark mode styles
  expect(screen.getByText('Title')).toHaveClass('dark:text-foreground')
})
```

## 📋 Implementation Priority

### **Priority 1** (Core Pages):
1. `/campaigns` - Main campaign management
2. `/contacts` - Contact management
3. `/login` - User authentication

### **Priority 2** (Admin Pages):
1. `/admin` - Admin dashboard
2. `/admin/users` - User management
3. `/admin/settings` - Admin settings

### **Priority 3** (Action Pages):
1. `/campaigns/create` - Campaign creation
2. `/campaigns/[id]/edit` - Campaign editing
3. Other action/edit pages

## 🔧 Advanced Topics

### **Custom CSS Variables**:
```css
/* Add to globals.css for custom dark mode colors */
:root {
  --campaign-success: 16 185 129;
  --campaign-warning: 245 158 11;
  --campaign-pending: 59 130 246;
}

.dark {
  --campaign-success: 34 197 94;
  --campaign-warning: 251 146 60;
  --campaign-pending: 96 165 250;
}
```

### **Conditional Rendering**:
```tsx
// Show different content based on theme
import { useTheme } from 'next-themes'

function ThemeAwareComponent() {
  const { theme } = useTheme()
  
  return (
    <div>
      {theme === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </div>
  )
}
```

## 📚 References

- **next-themes Documentation**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)
- **Tailwind CSS Dark Mode**: [https://tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode)
- **shadcn/ui Components**: [https://ui.shadcn.com/](https://ui.shadcn.com/)

## 🚀 Next Steps

1. **Implement dark mode** on all Priority 1 pages
2. **Test thoroughly** across different devices and browsers
3. **Update documentation** with any new patterns discovered
4. **Consider user feedback** and refine dark mode experience

---

*This guide should be updated as new dark mode patterns are discovered and implemented.*