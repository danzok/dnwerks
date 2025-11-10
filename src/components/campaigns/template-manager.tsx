"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, Filter, MoreVertical, Edit3, Trash2, Copy, Star, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/enhanced-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useTemplates } from "@/hooks/use-templates"
import { CampaignTemplateUI, TemplateCategory } from "@/lib/ui-types"

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

interface TemplateFormData {
  name: string
  description: string
  messageBody: string
  category: TemplateCategory
  isPublic: boolean
}

const initialFormData: TemplateFormData = {
  name: "",
  description: "",
  messageBody: "",
  category: "general",
  isPublic: false,
}

interface TemplateManagerProps {
  onOpenCreateModal?: () => void;
}

export function TemplateManager({ onOpenCreateModal }: TemplateManagerProps = {}) {
    const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplateUI | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    templates,
    isLoading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTemplates()

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.messageBody.trim()) return

    setIsSubmitting(true)
    try {
      await createTemplate(formData)
      setShowCreateModal(false)
      setFormData(initialFormData)
    } catch (error) {
      console.error("Failed to create template:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTemplate = async () => {
    if (!editingTemplate || !formData.name.trim() || !formData.messageBody.trim()) return

    setIsSubmitting(true)
    try {
      await updateTemplate(editingTemplate.id, formData)
      setEditingTemplate(null)
      setFormData(initialFormData)
    } catch (error) {
      console.error("Failed to update template:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    
    try {
      await deleteTemplate(id)
    } catch (error) {
      console.error("Failed to delete template:", error)
    }
  }

  const handleDuplicateTemplate = async (id: string) => {
    try {
      await duplicateTemplate(id)
    } catch (error) {
      console.error("Failed to duplicate template:", error)
    }
  }

  const openEditModal = (template: CampaignTemplateUI) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || "",
      messageBody: template.messageBody,
      category: template.category,
      isPublic: template.isPublic || false,
    })
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingTemplate(null)
    setFormData(initialFormData)
  }

  const getPreviewMessage = (messageBody: string) => {
    return messageBody
      .replace(/\{firstName\}/g, "John")
      .replace(/\{lastName\}/g, "Doe")
      .replace(/\[.*?\]/g, "[Sample]")
  }

  const characterLimit = 160
  const characterCount = formData.messageBody.length
  const charactersRemaining = characterLimit - characterCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Campaign Templates</h2>
          <p className="text-muted-foreground font-medium">
            Create and manage reusable message templates for your campaigns
          </p>
        </div>
        {onOpenCreateModal ? (
          <Button onClick={onOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        ) : (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable message template for future campaigns
                </DialogDescription>
              </DialogHeader>
              <TemplateForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateTemplate}
                onCancel={closeModal}
                isSubmitting={isSubmitting}
                characterCount={characterCount}
                charactersRemaining={charactersRemaining}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? null : value as TemplateCategory)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-16 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            {searchQuery || categoryFilter !== null
              ? "Try adjusting your search terms or filters"
              : "Get started by creating your first template"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium line-clamp-1 flex items-center gap-2">
                      {template.name}
                      {template.isPublic && (
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {template.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditModal(template)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <p className="text-xs text-gray-700 line-clamp-4">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your template details and message content
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEditTemplate}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
              characterCount={characterCount}
              charactersRemaining={charactersRemaining}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TemplateFormProps {
  formData: TemplateFormData
  setFormData: React.Dispatch<React.SetStateAction<TemplateFormData>>
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  characterCount: number
  charactersRemaining: number
  isEditing?: boolean
}

function TemplateForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  characterCount,
  charactersRemaining,
  isEditing = false,
}: TemplateFormProps) {
  const isFormValid = formData.name.trim() &&
                     formData.messageBody.trim() &&
                     formData.messageBody.length >= 10 &&
                     formData.messageBody.length <= 160

  const getPreviewMessage = (messageBody: string) => {
    return messageBody
      .replace(/\{firstName\}/g, "John")
      .replace(/\{lastName\}/g, "Doe")
      .replace(/\[.*?\]/g, "[Sample]")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Welcome Message"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TemplateCategory }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels)
                .filter(([key]) => key !== "all")
                .map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description of when to use this template"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="messageBody">Message Content *</Label>
        <Textarea
          id="messageBody"
          placeholder="Hi {firstName}, welcome to our service! Use {lastName} for last name..."
          value={formData.messageBody}
          onChange={(e) => setFormData(prev => ({ ...prev, messageBody: e.target.value }))}
          rows={4}
          className="resize-none mt-1"
        />
        <div className="flex justify-between items-center mt-2 text-sm">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const textarea = document.getElementById('messageBody') as HTMLTextAreaElement
                if (textarea) {
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const newValue = formData.messageBody.substring(0, start) + "{firstName}" + formData.messageBody.substring(end)
                  setFormData(prev => ({ ...prev, messageBody: newValue }))
                }
              }}
              className="text-xs"
            >
              + First Name
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const textarea = document.getElementById('messageBody') as HTMLTextAreaElement
                if (textarea) {
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const newValue = formData.messageBody.substring(0, start) + "{lastName}" + formData.messageBody.substring(end)
                  setFormData(prev => ({ ...prev, messageBody: newValue }))
                }
              }}
              className="text-xs"
            >
              + Last Name
            </Button>
          </div>
          <span className={`text-sm ${
            charactersRemaining < 0 ? 'text-red-600' :
            charactersRemaining < 20 ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {charactersRemaining} characters remaining ({characterCount}/160)
          </span>
        </div>
      </div>

      {formData.messageBody && (
        <div>
          <Label>Preview</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
            <p className="text-sm">{getPreviewMessage(formData.messageBody) || "Your message will appear here..."}</p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
        />
        <Label htmlFor="isPublic" className="text-sm">
          Make this template public (available to all users)
        </Label>
      </div>

      {!isFormValid && (
        <Alert>
          <AlertDescription>
            Please provide a name and message content (10-160 characters).
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Template" : "Create Template")}
        </Button>
      </div>
    </div>
  )
}