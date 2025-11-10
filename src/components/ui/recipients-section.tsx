"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  UserPlus, 
  Upload, 
  Filter,
  Check,
  ChevronDown
} from "lucide-react"

interface RecipientOption {
  id: string
  label: string
  description: string
  count: number
  type: "all" | "segment" | "list" | "custom"
}

interface RecipientsSelectionProps {
  options: RecipientOption[]
  selected?: string[]
  onSelectionChange?: (selected: string[]) => void
  allowMultiple?: boolean
  showPreview?: boolean
  className?: string
}

const RecipientsSelection = React.forwardRef<HTMLDivElement, RecipientsSelectionProps>(
  ({ 
    className, 
    options,
    selected = [],
    onSelectionChange,
    allowMultiple = false,
    showPreview = true,
    ...props 
  }, ref) => {
    
    const [selectedIds, setSelectedIds] = React.useState<string[]>(selected)
    
    const handleSelection = (optionId: string) => {
      let newSelection: string[]
      
      if (allowMultiple) {
        if (selectedIds.includes(optionId)) {
          newSelection = selectedIds.filter(id => id !== optionId)
        } else {
          newSelection = [...selectedIds, optionId]
        }
      } else {
        newSelection = [optionId]
      }
      
      setSelectedIds(newSelection)
      onSelectionChange?.(newSelection)
    }
    
    const totalRecipients = React.useMemo(() => {
      return options
        .filter(option => selectedIds.includes(option.id))
        .reduce((sum, option) => sum + option.count, 0)
    }, [options, selectedIds])
    
    const selectedOptions = React.useMemo(() => {
      return options.filter(option => selectedIds.includes(option.id))
    }, [options, selectedIds])

    return (
      <Card ref={ref} className={cn("card-elevated", className)} {...props}>
        <CardHeader className="content-padding border-b border-border/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Select Recipients
            </CardTitle>
            
            {totalRecipients > 0 && (
              <Badge variant="secondary" className="text-sm font-semibold">
                {totalRecipients.toLocaleString()} selected
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="content-padding space-y-6">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Contacts
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Create Segment
            </Button>
          </div>
          
          {/* Recipient Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id)
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "relative border rounded-lg p-4 cursor-pointer transition-all duration-200",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                  onClick={() => handleSelection(option.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Custom Radio/Checkbox */}
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
                        isSelected 
                          ? "border-primary bg-primary" 
                          : "border-gray-300"
                      )}>
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">
                          {option.label}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {option.count.toLocaleString()} contacts
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {option.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Preview Section */}
          {showPreview && selectedOptions.length > 0 && (
            <div className="space-y-3">
              <div className="border-t border-border/20 pt-6">
                <h4 className="font-semibold text-foreground mb-3">
                  Selection Preview
                </h4>
                
                <div className="space-y-2">
                  {selectedOptions.map((option) => (
                    <div 
                      key={option.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {option.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="font-semibold text-foreground">
                      Total Recipients
                    </span>
                    <span className="font-bold text-primary">
                      {totalRecipients.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

RecipientsSelection.displayName = "RecipientsSelection"

// Example usage component
export function ExampleRecipientsSelection() {
  const recipientOptions: RecipientOption[] = [
    {
      id: "all",
      label: "All Customers",
      description: "Send to your entire customer database",
      count: 15247,
      type: "all"
    },
    {
      id: "active",
      label: "Active Customers",
      description: "Customers who have made a purchase in the last 90 days",
      count: 8934,
      type: "segment"
    },
    {
      id: "new",
      label: "New Customers",
      description: "Customers who signed up in the last 30 days",
      count: 1205,
      type: "segment"
    },
    {
      id: "vip",
      label: "VIP Customers",
      description: "High-value customers with lifetime value over $1000",
      count: 342,
      type: "list"
    }
  ]

  return (
    <RecipientsSelection
      options={recipientOptions}
      allowMultiple={false}
      showPreview={true}
    />
  )
}

export { RecipientsSelection }