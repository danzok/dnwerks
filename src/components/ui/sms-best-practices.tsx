"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Clock,
  Target,
  Shield
} from "lucide-react"

interface BestPracticeItem {
  id: string
  title: string
  description: string
  type: "tip" | "warning" | "error" | "success"
  category: "content" | "timing" | "compliance" | "engagement"
  expanded?: boolean
}

interface SMSBestPracticesProps {
  practices?: BestPracticeItem[]
  defaultExpanded?: boolean
  className?: string
}

const defaultPractices: BestPracticeItem[] = [
  {
    id: "character-limit",
    title: "Keep messages under 160 characters",
    description: "SMS messages over 160 characters are split into multiple parts, which can increase costs and reduce readability. Aim for concise, clear messaging.",
    type: "tip",
    category: "content"
  },
  {
    id: "clear-sender",
    title: "Use a clear sender ID",
    description: "Recipients should immediately recognize who sent the message. Use your business name or a recognizable short code.",
    type: "tip",
    category: "content"
  },
  {
    id: "opt-out",
    title: "Always include opt-out instructions",
    description: "Include 'Reply STOP to opt out' or similar language. This is required by law in most jurisdictions and builds trust.",
    type: "warning",
    category: "compliance"
  },
  {
    id: "timing",
    title: "Respect time zones and business hours",
    description: "Send messages between 8 AM and 9 PM in the recipient's local time zone. Avoid early mornings, late nights, and major holidays.",
    type: "tip",
    category: "timing"
  },
  {
    id: "personalization",
    title: "Personalize when possible",
    description: "Use customer names, purchase history, or preferences to make messages more relevant and engaging.",
    type: "success",
    category: "engagement"
  },
  {
    id: "consent",
    title: "Obtain proper consent",
    description: "Ensure you have explicit permission to send SMS messages. Keep records of consent for compliance purposes.",
    type: "error",
    category: "compliance"
  },
  {
    id: "call-to-action",
    title: "Include a clear call-to-action",
    description: "Tell recipients exactly what you want them to do next. Use action words and make it easy to follow through.",
    type: "success",
    category: "engagement"
  },
  {
    id: "frequency",
    title: "Don't overwhelm with frequency",
    description: "Too many messages can lead to opt-outs. Space out your communications and provide value with each message.",
    type: "warning",
    category: "engagement"
  }
]

const SMSBestPractices = React.forwardRef<HTMLDivElement, SMSBestPracticesProps>(
  ({ 
    className, 
    practices = defaultPractices,
    defaultExpanded = false,
    ...props 
  }, ref) => {
    
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
      new Set(defaultExpanded ? practices.map(p => p.id) : [])
    )
    
    const [isMainExpanded, setIsMainExpanded] = React.useState(defaultExpanded)
    
    const toggleItem = (itemId: string) => {
      const newExpanded = new Set(expandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setExpandedItems(newExpanded)
    }
    
    const getTypeIcon = (type: BestPracticeItem["type"]) => {
      switch (type) {
        case "tip":
          return <Info className="h-4 w-4 text-blue-600" />
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-600" />
        case "warning":
          return <AlertTriangle className="h-4 w-4 text-yellow-600" />
        case "error":
          return <XCircle className="h-4 w-4 text-red-600" />
      }
    }
    
    const getCategoryIcon = (category: BestPracticeItem["category"]) => {
      switch (category) {
        case "content":
          return <MessageSquare className="h-3 w-3" />
        case "timing":
          return <Clock className="h-3 w-3" />
        case "compliance":
          return <Shield className="h-3 w-3" />
        case "engagement":
          return <Target className="h-3 w-3" />
      }
    }
    
    const getTypeBackground = (type: BestPracticeItem["type"]) => {
      switch (type) {
        case "tip":
          return "bg-blue-50 border-blue-200"
        case "success":
          return "bg-green-50 border-green-200"
        case "warning":
          return "bg-yellow-50 border-yellow-200"
        case "error":
          return "bg-red-50 border-red-200"
      }
    }
    
    const categorizedPractices = React.useMemo(() => {
      const groups: Record<string, BestPracticeItem[]> = {
        content: [],
        timing: [],
        compliance: [],
        engagement: []
      }
      
      practices.forEach(practice => {
        groups[practice.category].push(practice)
      })
      
      return groups
    }, [practices])

    return (
      <Collapsible
        open={isMainExpanded}
        onOpenChange={setIsMainExpanded}
      >
        <Card ref={ref} className={cn("card-elevated", className)} {...props}>
          <CollapsibleTrigger asChild>
            <CardHeader className="content-padding border-b border-border/20 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  SMS Best Practices
                </CardTitle>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isMainExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="content-padding space-y-6">
              {Object.entries(categorizedPractices).map(([category, items]) => (
                items.length > 0 && (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center">
                        {getCategoryIcon(category as BestPracticeItem["category"])}
                      </div>
                      <h4 className="font-semibold text-foreground capitalize">
                        {category}
                      </h4>
                    </div>
                    
                    <div className="space-y-3 ml-8">
                      {items.map((practice) => {
                        const isExpanded = expandedItems.has(practice.id)
                        
                        return (
                          <Collapsible
                            key={practice.id}
                            open={isExpanded}
                            onOpenChange={() => toggleItem(practice.id)}
                          >
                            <div className={cn(
                              "border rounded-lg transition-all duration-200",
                              getTypeBackground(practice.type)
                            )}>
                              <CollapsibleTrigger asChild>
                                <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/50 transition-colors">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getTypeIcon(practice.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-foreground">
                                      {practice.title}
                                    </h5>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="px-4 pb-4 pt-0">
                                  <div className="pl-7">
                                    <p className="text-sm text-muted-foreground">
                                      {practice.description}
                                    </p>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )
                      })}
                    </div>
                  </div>
                )
              ))}
              
              <div className="pt-4 border-t border-border/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>
                    Following these practices will improve delivery rates and customer engagement.
                  </span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }
)

SMSBestPractices.displayName = "SMSBestPractices"

export { SMSBestPractices }