"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface CampaignSummaryItem {
  label: string
  value: string | number
  icon: React.ReactNode
  description?: string
  status?: "info" | "success" | "warning" | "error"
}

interface CampaignSummaryProps {
  title?: string
  items: CampaignSummaryItem[]
  progress?: {
    current: number
    total: number
    label: string
  }
  className?: string
  sticky?: boolean
}

const CampaignSummary = React.forwardRef<HTMLDivElement, CampaignSummaryProps>(
  ({ 
    className, 
    title = "Campaign Summary",
    items,
    progress,
    sticky = true,
    ...props 
  }, ref) => {
    
    const getStatusIcon = (status?: string) => {
      switch (status) {
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-600" />
        case "warning":
          return <AlertCircle className="h-4 w-4 text-yellow-600" />
        case "error":
          return <AlertCircle className="h-4 w-4 text-red-600" />
        default:
          return null
      }
    }
    
    const getStatusBadgeVariant = (status?: string) => {
      switch (status) {
        case "success":
          return "default"
        case "warning":
          return "secondary"
        case "error":
          return "destructive"
        default:
          return "outline"
      }
    }

    return (
      <Card 
        ref={ref}
        className={cn(
          "card-elevated layout-sidebar",
          sticky && "sticky top-6",
          className
        )}
        {...props}
      >
        <CardHeader className="content-padding border-b border-border/20">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            {title}
          </CardTitle>
          
          {progress && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {progress.label}
                </span>
                <span className="text-sm font-semibold">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress 
                value={(progress.current / progress.total) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="content-padding space-y-6">
          <dl className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="text-lg font-bold text-foreground truncate">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                  {item.status && (
                    <div className="flex items-center gap-1 ml-2">
                      {getStatusIcon(item.status)}
                    </div>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground pl-11">
                    {item.description}
                  </p>
                )}
                
                {item.status && (
                  <div className="pl-11">
                    <Badge 
                      variant={getStatusBadgeVariant(item.status)}
                      className="text-xs"
                    >
                      {item.status === "success" && "Ready"}
                      {item.status === "warning" && "Review"}
                      {item.status === "error" && "Error"}
                      {item.status === "info" && "Info"}
                    </Badge>
                  </div>
                )}
                
                {/* Visual separator except for last item */}
                {index < items.length - 1 && (
                  <div className="border-t border-border/20 pt-6 -mb-6" />
                )}
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    )
  }
)

CampaignSummary.displayName = "CampaignSummary"

// Example usage component
export function ExampleCampaignSummary() {
  const summaryItems: CampaignSummaryItem[] = [
    {
      label: "Recipients",
      value: "1,247 contacts",
      icon: <Users className="h-4 w-4" />,
      description: "Selected from customer database",
      status: "success"
    },
    {
      label: "Message",
      value: "142 characters",
      icon: <MessageSquare className="h-4 w-4" />,
      description: "Within SMS limit",
      status: "success"
    },
    {
      label: "Scheduled Time",
      value: "Jan 15, 2:00 PM",
      icon: <Calendar className="h-4 w-4" />,
      description: "Optimal send time",
      status: "info"
    },
    {
      label: "Estimated Cost",
      value: "$24.94",
      icon: <DollarSign className="h-4 w-4" />,
      description: "$0.02 per message",
      status: "info"
    },
    {
      label: "Delivery Window",
      value: "2-5 minutes",
      icon: <Clock className="h-4 w-4" />,
      description: "Average delivery time",
      status: "info"
    }
  ]

  const progress = {
    current: 4,
    total: 5,
    label: "Setup Progress"
  }

  return (
    <CampaignSummary
      items={summaryItems}
      progress={progress}
    />
  )
}

export { CampaignSummary }