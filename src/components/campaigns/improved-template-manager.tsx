"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Filter,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
} from "lucide-react";
import { CampaignTemplateUI, TemplateCategory } from "@/lib/ui-types";
import { useTemplates } from "@/hooks/use-templates";
import { ReusableTemplateModal } from "./reusable-template-modal";

const CATEGORY_CONFIG: Record<TemplateCategory, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  general: {
    label: "General",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    icon: <MessageSquare className="w-3 h-3" />,
  },
  marketing: {
    label: "Marketing", 
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    icon: <Sparkles className="w-3 h-3" />,
  },
  reminders: {
    label: "Reminders",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    icon: <Calendar className="w-3 h-3" />,
  },
  alerts: {
    label: "Alerts",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  announcements: {
    label: "Announcements",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
    icon: <Building className="w-3 h-3" />,
  },
};

interface ImprovedTemplateManagerProps {
  onTemplateSelect?: (template: CampaignTemplateUI) => void;
  showCreateModal?: boolean;
  onOpenCreateModal?: () => void;
}

export function ImprovedTemplateManager({ 
  onTemplateSelect,
  showCreateModal: externalShowCreateModal,
  onOpenCreateModal 
}: ImprovedTemplateManagerProps) {
  const {
    templates,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplateUI | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<CampaignTemplateUI | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CampaignTemplateUI | null>(null);

  // Handle external control of create modal
  useEffect(() => {
    if (externalShowCreateModal !== undefined) {
      setShowCreateModal(externalShowCreateModal);
    }
  }, [externalShowCreateModal]);

  const handleCreateTemplate = async (templateData: Partial<CampaignTemplateUI>) => {
    try {
      await createTemplate(templateData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating template:", error);
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleUpdateTemplate = async (templateData: Partial<CampaignTemplateUI>) => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate(editingTemplate.id, templateData);
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    
    try {
      await deleteTemplate(deletingTemplate.id);
      setDeletingTemplate(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicateTemplate = async (template: CampaignTemplateUI) => {
    try {
      await createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        messageBody: template.messageBody,
        category: template.category,
        isPublic: false, // Copies are private by default
      });
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const openCreateModal = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setShowCreateModal(true);
    }
  };

  const getPreviewMessage = (message: string, maxLength: number = 100) => {
    const preview = message
      .replace(/\{\{firstName\}\}/g, "John")
      .replace(/\{\{lastName\}\}/g, "Smith")
      .replace(/\{\{fullName\}\}/g, "John Smith")
      .replace(/\{\{email\}\}/g, "john.smith@example.com")
      .replace(/\{\{phone\}\}/g, "+1 (555) 123-4567")
      .replace(/\{\{company\}\}/g, "Acme Corp");
    
    return preview.length > maxLength ? `${preview.substring(0, maxLength)}...` : preview;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Message Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable message templates for your SMS campaigns
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => setCategoryFilter(value === "all" ? null : value as TemplateCategory)}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Summary */}
        <div className="mt-3 text-sm text-muted-foreground">
          {filteredTemplates.length === templates.length 
            ? `${templates.length} template${templates.length !== 1 ? 's' : ''} total`
            : `${filteredTemplates.length} of ${templates.length} templates`
          }
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter 
                  ? "Try adjusting your search or filters"
                  : "Create your first message template to get started"
                }
              </p>
            </div>
            {!searchQuery && !categoryFilter && (
              <Button onClick={openCreateModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTemplateSelect?.(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${CATEGORY_CONFIG[template.category || 'general'].color} gap-1`}
                      >
                        {CATEGORY_CONFIG[template.category || 'general'].icon}
                        {CATEGORY_CONFIG[template.category || 'general'].label}
                      </Badge>
                    </div>
                    
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {template.isPublic && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Public
                      </Badge>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplate(template);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTemplate(template);
                          }}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Message Preview */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">Message Preview:</p>
                    <p className="text-sm">{getPreviewMessage(template.messageBody || '')}</p>
                  </div>

                  {/* Template Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {template.messageBody?.length || 0} chars
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Recently'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Ready to use
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <ReusableTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTemplate}
        title="Create Message Template"
        description="Create a reusable message template for your SMS campaigns"
      />

      {/* Edit Template Modal */}
      <ReusableTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSave={handleUpdateTemplate}
        template={editingTemplate || undefined}
        title="Edit Message Template"
        description="Update your message template details and content"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      {previewTemplate && (
        <ReusableTemplateModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSave={async () => {}} // No save functionality in preview mode
          template={previewTemplate}
          title={`Preview: ${previewTemplate.name}`}
          description="Preview how this template will look to recipients"
        />
      )}
    </div>
  );
}