# Vercel Component Templates

## Overview

This document provides reusable component templates following Vercel's design system. These templates can be copied and adapted for consistent implementation across the DNwerks platform.

## Core Component Templates

### 1. Metric Card Template

```tsx
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold font-mono text-black dark:text-white">
              {value}
            </p>
            {description && (
              <p className="text-xs text-[#666666] dark:text-[#888888]">
                {description}
              </p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <Icon className="h-4 w-4 text-[#999999] dark:text-[#666666]" />
        </div>
      </CardContent>
    </Card>
  )
}
```

**Usage Example**:
```tsx
<MetricCard
  title="Total Users"
  value="2,547"
  description="Registered users"
  icon={Users}
  trend={{ value: "12%", isPositive: true }}
/>
```

### 2. Status Badge Template

```tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "success" | "error" | "warning" | "info" | "disabled"

interface StatusBadgeProps {
  status: StatusType
  children: React.ReactNode
  className?: string
}

const statusConfig = {
  success: {
    light: "bg-[#E6F7FF] text-[#0070F3] border-[#BAE7FF]",
    dark: "dark:bg-[#0A1A2A] dark:text-[#50E3C2] dark:border-[#1A3A4A]"
  },
  error: {
    light: "bg-[#FFEEEE] text-[#EE0000] border-[#FFCCCC]",
    dark: "dark:bg-[#2A0A0A] dark:text-[#FF6B6B] dark:border-[#4A0A0A]"
  },
  warning: {
    light: "bg-[#FFF7E6] text-[#F5A623] border-[#FFE7BA]",
    dark: "dark:bg-[#2A1A0A] dark:text-[#FFB84D] dark:border-[#4A2A0A]"
  },
  info: {
    light: "bg-[#F0F9FF] text-[#0EA5E9] border-[#E0F2FE]",
    dark: "dark:bg-[#0A1929] dark:text-[#38BDF8] dark:border-[#1E3A5F]"
  },
  disabled: {
    light: "bg-[#F5F5F5] text-[#999999] border-[#EAEAEA]",
    dark: "dark:bg-[#1A1A1A] dark:text-[#666666] dark:border-[#333333]"
  }
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge className={cn(
      "border",
      config.light,
      config.dark,
      className
    )}>
      {children}
    </Badge>
  )
}
```

**Usage Example**:
```tsx
<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="error">Disabled</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
```

### 3. Vercel Button Template

```tsx
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface VercelButtonProps {
  variant?: "primary" | "outline" | "ghost" | "danger"
  size?: "sm" | "default" | "lg"
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  children: React.ReactNode
  className?: string
  [key: string]: any
}

const variantStyles = {
  primary: "bg-[#0070F3] hover:bg-[#0060D8] text-white border-transparent",
  outline: "border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-black dark:text-white",
  ghost: "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-black dark:text-white",
  danger: "bg-[#EE0000] hover:bg-[#CC0000] text-white border-transparent"
}

const sizeStyles = {
  sm: "h-8 px-3 text-xs",
  default: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base"
}

export function VercelButton({
  variant = "primary",
  size = "default",
  icon: Icon,
  iconPosition = "left",
  children,
  className,
  ...props
}: VercelButtonProps) {
  return (
    <Button
      className={cn(
        "rounded-lg transition-colors duration-200",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon className="h-4 w-4 mr-2" />
      )}
      {children}
      {Icon && iconPosition === "right" && (
        <Icon className="h-4 w-4 ml-2" />
      )}
    </Button>
  )
}
```

**Usage Example**:
```tsx
<VercelButton variant="primary" icon={Plus}>Add User</VercelButton>
<VercelButton variant="outline" icon={Settings}>Settings</VercelButton>
<VercelButton variant="ghost" icon={Trash2} iconPosition="right">Delete</VercelButton>
```

### 4. Page Header Template

```tsx
import { LucideIcon } from "lucide-react"
import { VercelButton } from "./vercel-button"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: Array<{
    label: string
    variant?: "primary" | "outline" | "ghost" | "danger"
    icon?: LucideIcon
    onClick: () => void
  }>
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#666666] dark:text-[#888888] mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <VercelButton
              key={index}
              variant={action.variant}
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </VercelButton>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Usage Example**:
```tsx
<PageHeader
  title="User Management"
  description="Create, manage, and configure user accounts and permissions."
  actions={[
    { label: "Add User", variant: "primary", icon: UserPlus, onClick: handleAddUser },
    { label: "Export", variant: "outline", icon: Download, onClick: handleExport }
  ]}
/>
```

### 5. Data Table Template

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./status-badge"
import { LucideIcon } from "lucide-react"

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  icon?: LucideIcon
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Array<{
    label: string
    icon: LucideIcon
    onClick: (row: T) => void
    variant?: "primary" | "outline" | "ghost" | "danger"
  }>
}

export function DataTable<T>({ data, columns, actions }: DataTableProps<T>) {
  return (
    <div className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#EAEAEA] dark:border-[#333333]">
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="text-xs font-medium text-[#666666] dark:text-[#888888] uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  {column.icon && <column.icon className="h-3 w-3" />}
                  {column.label}
                </div>
              </TableHead>
            ))}
            {actions && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]">
              {columns.map((column) => (
                <TableCell key={String(column.key)} className="text-sm text-black dark:text-white">
                  {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                </TableCell>
              ))}
              {actions && (
                <TableCell>
                  <div className="flex gap-1">
                    {actions.map((action, actionIndex) => (
                      <VercelButton
                        key={actionIndex}
                        variant="ghost"
                        size="sm"
                        icon={action.icon}
                        onClick={() => action.onClick(row)}
                      />
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**Usage Example**:
```tsx
const columns: Column<User>[] = [
  { key: "name", label: "Name", icon: User },
  { key: "email", label: "Email" },
  { 
    key: "status", 
    label: "Status",
    render: (status) => <StatusBadge status={status}>{status}</StatusBadge>
  }
]

const actions = [
  { label: "Edit", icon: Edit, onClick: handleEdit },
  { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "danger" }
]

<DataTable data={users} columns={columns} actions={actions} />
```

### 6. Form Field Template

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, description, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={cn(
        "text-sm font-medium text-black dark:text-white",
        required && "after:content-['*'] after:ml-0.5 after:text-red-500"
      )}>
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-[#666666] dark:text-[#888888]">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
```

**Usage Example**:
```tsx
<FormField label="Email Address" description="We'll never share your email with anyone else." required>
  <Input 
    type="email" 
    placeholder="user@example.com"
    className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
  />
</FormField>
```

### 7. Settings Section Template

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { LucideIcon } from "lucide-react"

interface SettingItem {
  id: string
  label: string
  description: string
  type: "switch" | "input" | "select"
  value: any
  onChange: (value: any) => void
  icon?: LucideIcon
}

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  settings: SettingItem[]
}

export function SettingsSection({ title, description, icon: Icon, settings }: SettingsSectionProps) {
  return (
    <Card className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4 text-[#0070F3]" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-[#666666] dark:text-[#888888]">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between p-3 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {setting.icon && <setting.icon className="h-4 w-4 text-[#666666] dark:text-[#888888]" />}
                <label className="text-sm font-medium text-black dark:text-white">
                  {setting.label}
                </label>
              </div>
              {setting.description && (
                <p className="text-xs text-[#666666] dark:text-[#888888] mt-1">
                  {setting.description}
                </p>
              )}
            </div>
            {setting.type === "switch" && (
              <Switch
                checked={setting.value}
                onCheckedChange={setting.onChange}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Usage Example**:
```tsx
const notificationSettings = [
  {
    id: "email",
    label: "Email Notifications",
    description: "Receive notifications via email",
    type: "switch" as const,
    value: emailNotifications,
    onChange: setEmailNotifications,
    icon: Mail
  },
  {
    id: "sms",
    label: "SMS Notifications",
    description: "Receive notifications via SMS",
    type: "switch" as const,
    value: smsNotifications,
    onChange: setSmsNotifications,
    icon: Phone
  }
]

<SettingsSection
  title="Notification Preferences"
  description="Configure how and when system notifications are sent"
  icon={Bell}
  settings={notificationSettings}
/>
```

## Layout Templates

### 1. Dashboard Layout Template

```tsx
import { PageHeader } from "./page-header"

interface DashboardLayoutProps {
  title: string
  description?: string
  actions?: Array<{
    label: string
    variant?: "primary" | "outline" | "ghost" | "danger"
    icon?: LucideIcon
    onClick: () => void
  }>
  children: React.ReactNode
}

export function DashboardLayout({ title, description, actions, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black">
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
        <PageHeader title={title} description={description} actions={actions} />
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### 2. Grid Layout Templates

```tsx
// Metrics Grid
export function MetricsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}

// Two Column Layout
export function TwoColumnLayout({ left, right }: { 
  left: React.ReactNode
  right: React.ReactNode 
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}

// Three Column Layout
export function ThreeColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {children}
    </div>
  )
}
```

## Usage Guidelines

### 1. Consistency Rules
- Always use the provided templates for consistent styling
- Follow the established color palette exactly
- Maintain proper spacing using the defined system
- Use the correct typography hierarchy

### 2. Customization
- Extend templates rather than modifying them directly
- Keep custom styling minimal and purposeful
- Test changes in both light and dark modes
- Ensure accessibility compliance

### 3. Performance
- Use React.memo for frequently rendered components
- Implement proper loading states
- Optimize re-renders with useCallback/useMemo
- Keep component props minimal

### 4. Accessibility
- Always include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

These templates provide a solid foundation for implementing Vercel's design system consistently across the DNwerks platform while maintaining flexibility for specific use cases.