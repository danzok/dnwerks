"use client"

import * as React from "react"
import { useState } from "react"
import { Search, Filter, Star, Copy, Eye, X, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/enhanced-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import { useTemplates } from "@/hooks/use-templates"
import { CampaignTemplateUI, TemplateCategory } from "@/lib/ui-types"

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: CampaignTemplateUI) => void
}

const categoryLabels: Record<TemplateCategory | "all", string> = {
  all: "All Categories",
  general: "General",
  marketing: "Marketing",
  reminders: "Reminders",
  alerts: "Alerts",
  announcements: "Announcements",
}

const categoryVariants: Record<TemplateCategory, "general" | "marketing" | "reminders" | "alerts" | "announcements"> = {
  general: "general",
  marketing: "marketing",
  reminders: "reminders",
  alerts: "alerts",
  announcements: "announcements",
}

export function TemplateSelector({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | "all">("all")
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplateUI | null>(null)
  
  const { templates, isLoading } = useTemplates()

  const handleSelectTemplate = (template: CampaignTemplateUI) => {
    onSelectTemplate(template)
    onClose()
  }

  const getPreviewMessage = (messageBody: string) => {
    return messageBody
      .replace(/\{firstName\}/g, "John")
      .replace(/\{lastName\}/g, "Doe")
      .replace(/\[.*?\]/g, "[Sample]") // Replace placeholder brackets with [Sample]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Select a pre-made template to get started quickly with your campaign
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex gap-4 pb-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TemplateCategory | "all")}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="cursor-pointer">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Skeleton className="h-16 w-full" />
                    <div className="flex justify-between items-center mt-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground font-medium max-w-sm">
                Try adjusting your search terms or filters to find more templates
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border hover:border-gray-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium line-clamp-1">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {template.description || "No description provided"}
                        </CardDescription>
                      </div>
                      {template.isPublic && (
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <p className="text-xs text-gray-700 line-clamp-3">
                        {getPreviewMessage(template.messageBody)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={categoryVariants[template.category]}
                        className="text-xs font-medium"
                      >
                        {categoryLabels[template.category]}
                      </Badge>
                      </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle>{selectedTemplate.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedTemplate.description || "No description provided"}
                    </DialogDescription>
                  </div>
                  <Badge variant={categoryVariants[selectedTemplate.category]} className="font-medium">
                    {categoryLabels[selectedTemplate.category]}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Original Message</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">{selectedTemplate.messageBody}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Preview with Sample Data</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800">
                      {getPreviewMessage(selectedTemplate.messageBody)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>This template is ready to use</span>
                  {selectedTemplate.isPublic && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Popular template</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setSelectedTemplate(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleSelectTemplate(selectedTemplate)}
                    className="flex-1"
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}