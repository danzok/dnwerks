"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Building,
  Tag,
  Eye,
} from "lucide-react";
import { CampaignTemplateUI, TemplateCategory } from "@/lib/ui-types";

const CATEGORY_CONFIG: Record<TemplateCategory, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  general: {
    label: "General",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "General purpose messages and communications"
  },
  marketing: {
    label: "Marketing",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Promotional content and marketing campaigns"
  },
  reminders: {
    label: "Reminders",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    icon: <Calendar className="w-4 h-4" />,
    description: "Appointment reminders and follow-ups"
  },
  alerts: {
    label: "Alerts",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    icon: <AlertCircle className="w-4 h-4" />,
    description: "Urgent notifications and alerts"
  },
  announcements: {
    label: "Announcements",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    icon: <Building className="w-4 h-4" />,
    description: "Company news and announcements"
  },
};

const MESSAGE_PLACEHOLDERS = [
  { key: "{{firstName}}", description: "Customer's first name" },
  { key: "{{lastName}}", description: "Customer's last name" },
  { key: "{{fullName}}", description: "Customer's full name" },
  { key: "{{email}}", description: "Customer's email address" },
  { key: "{{phone}}", description: "Customer's phone number" },
  { key: "{{company}}", description: "Customer's company name" },
];

interface ReusableTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<CampaignTemplateUI>) => Promise<void>;
  template?: CampaignTemplateUI; // For editing existing templates
  title?: string;
  description?: string;
}

interface FormData {
  name: string;
  description: string;
  messageBody: string;
  category: TemplateCategory;
  isPublic: boolean;
}

const CHARACTER_LIMIT = 1600; // SMS character limit

export function ReusableTemplateModal({
  isOpen,
  onClose,
  onSave,
  template,
  title = "Create Message Template",
  description = "Create a reusable message template for your SMS campaigns"
}: ReusableTemplateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    messageBody: "",
    category: "general",
    isPublic: false,
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with template data if editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        messageBody: template.messageBody || "",
        category: template.category || "general",
        isPublic: template.isPublic || false,
      });
    } else {
      // Reset form when creating new template
      setFormData({
        name: "",
        description: "",
        messageBody: "",
        category: "general",
        isPublic: false,
      });
    }
    setErrors({});
  }, [template, isOpen]);

  const characterCount = formData.messageBody.length;
  const charactersRemaining = CHARACTER_LIMIT - characterCount;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    
    if (!formData.messageBody.trim()) {
      newErrors.messageBody = "Message content is required";
    } else if (formData.messageBody.trim().length < 10) {
      newErrors.messageBody = "Message must be at least 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('messageBody') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = formData.messageBody.substring(0, start) + placeholder + formData.messageBody.substring(end);
      
      setFormData(prev => ({ ...prev, messageBody: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const getPreviewMessage = (message: string) => {
    return message
      .replace(/\{\{firstName\}\}/g, "John")
      .replace(/\{\{lastName\}\}/g, "Smith")
      .replace(/\{\{fullName\}\}/g, "John Smith")
      .replace(/\{\{email\}\}/g, "john.smith@example.com")
      .replace(/\{\{phone\}\}/g, "+1 (555) 123-4567")
      .replace(/\{\{company\}\}/g, "Acme Corporation");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        messageBody: formData.messageBody.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
            <div className="flex gap-6 h-full">
              {/* Main Form */}
              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Template Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Template Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Welcome Message, Appointment Reminder"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: TemplateCategory) => 
                            setFormData(prev => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Brief description of when to use this template"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    {/* Category Info */}
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={CATEGORY_CONFIG[formData.category].color}>
                          {CATEGORY_CONFIG[formData.category].icon}
                          {CATEGORY_CONFIG[formData.category].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {CATEGORY_CONFIG[formData.category].description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Message Content */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="messageBody" className="text-sm font-medium">
                        Message Text <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="messageBody"
                        placeholder="Enter your message template here. Use placeholders like {{firstName}} for personalization."
                        value={formData.messageBody}
                        onChange={(e) => setFormData(prev => ({ ...prev, messageBody: e.target.value }))}
                        className={`min-h-[120px] resize-none ${errors.messageBody ? "border-red-500" : ""}`}
                        rows={6}
                      />
                      <div className="flex items-center justify-between text-sm">
                        {errors.messageBody && (
                          <p className="text-red-500">{errors.messageBody}</p>
                        )}
                        <div className="ml-auto">
                          <span className={`${isOverLimit ? "text-red-500" : charactersRemaining < 50 ? "text-orange-500" : "text-muted-foreground"}`}>
                            {characterCount}/{CHARACTER_LIMIT}
                          </span>
                        </div>
                      </div>
                      {isOverLimit && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Message exceeds SMS character limit. Consider shortening your message.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Placeholder Buttons */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Quick Placeholders
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MESSAGE_PLACEHOLDERS.map((placeholder) => (
                          <Tooltip key={placeholder.key}>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertPlaceholder(placeholder.key)}
                                className="text-xs"
                              >
                                {placeholder.key}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{placeholder.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div className="w-80 space-y-4 overflow-y-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Message Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Phone Mock-up */}
                    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            YC
                          </div>
                          <div>
                            <p className="text-sm font-medium">Your Company</p>
                            <p className="text-xs text-muted-foreground">SMS Message</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-bl-sm max-w-xs">
                          {formData.messageBody ? (
                            <p className="text-sm whitespace-pre-wrap">
                              {getPreviewMessage(formData.messageBody)}
                            </p>
                          ) : (
                            <p className="text-sm text-blue-100 italic">
                              Message preview will appear here...
                            </p>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Characters:</span>
                        <span className={isOverLimit ? "text-red-500 font-medium" : ""}>
                          {characterCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Est. SMS Parts:</span>
                        <span>{Math.ceil(characterCount / 160) || 1}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Placeholders:</span>
                        <span>{(formData.messageBody.match(/\{\{[^}]+\}\}/g) || []).length}</span>
                      </div>
                    </div>

                    {/* Template Info */}
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Template Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="truncate max-w-[120px]">
                            {formData.name || "Untitled"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <Badge variant="outline" className={`${CATEGORY_CONFIG[formData.category].color} text-xs`}>
                            {CATEGORY_CONFIG[formData.category].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isOverLimit || !formData.name.trim() || !formData.messageBody.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>Creating...</>
                ) : template ? (
                  <>Update Template</>
                ) : (
                  <>Create Template</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}