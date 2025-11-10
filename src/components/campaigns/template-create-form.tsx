"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  User,
  UserPlus,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles
} from "lucide-react";
import { CampaignTemplate, TemplateCategory } from "@/lib/schema";
import { useTemplates } from "@/hooks/use-templates";

const categoryLabels: Record<TemplateCategory, string> = {
  general: "General",
  marketing: "Marketing",
  reminders: "Reminders",
  alerts: "Alerts",
  announcements: "Announcements",
};

const categoryColors: Record<TemplateCategory, string> = {
  general: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  marketing: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  reminders: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  alerts: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  announcements: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
};

interface TemplateFormData {
  name: string;
  description: string;
  messageBody: string;
  category: TemplateCategory;
  isPublic: boolean;
}

const initialFormData: TemplateFormData = {
  name: "",
  description: "",
  messageBody: "",
  category: "general",
  isPublic: false,
};

interface TemplateCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TemplateCreateForm({ onSuccess, onCancel }: TemplateCreateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { createTemplate } = useTemplates();

  const characterLimit = 160;
  const characterCount = formData.messageBody.length;
  const charactersRemaining = characterLimit - characterCount;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.messageBody.trim()) {
      newErrors.messageBody = "Message content is required";
    } else if (formData.messageBody.trim().length < 10) {
      newErrors.messageBody = "Message must be at least 10 characters";
    } else if (formData.messageBody.length > characterLimit) {
      newErrors.messageBody = `Message exceeds ${characterLimit} character limit`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createTemplate(formData);
      setShowSuccess(true);
      setFormData(initialFormData);

      // Show success message briefly before closing
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      setErrors({ submit: "Failed to create template. Please try again." });
      console.error("Failed to create template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = formData.messageBody.substring(0, start) + variable + formData.messageBody.substring(end);

    setFormData(prev => ({ ...prev, messageBody: newText }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const getPreviewMessage = (messageBody: string) => {
    return messageBody
      .replace(/\{firstName\}/g, "John")
      .replace(/\{lastName\}/g, "Doe")
      .replace(/\{email\}/g, "john.doe@example.com")
      .replace(/\{phone\}/g, "+1 (555) 123-4567")
      .replace(/\[.*?\]/g, "[Sample]");
  };

  const getStatusColor = () => {
    if (charactersRemaining < 0) return "text-red-600";
    if (charactersRemaining < 20) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusText = () => {
    if (charactersRemaining < 0) return "Too long";
    if (charactersRemaining < 20) return "Getting long";
    return "Good length";
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-none">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success Message */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Template created successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errors.submit && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="border bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Welcome Message"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    className={`h-11 ${errors.name ? "border-red-300 focus:ring-red-200" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TemplateCategory }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Badge className={categoryColors[value as TemplateCategory]}>
                              {label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of when to use this template"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card className="border bg-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Message Content</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant={charactersRemaining < 0 ? "destructive" : "secondary"} className="text-xs">
                    {characterCount}/{characterLimit}
                  </Badge>
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variable Insertion Buttons */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Personalization Variables
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("{firstName}")}
                        className="text-xs h-8"
                      >
                        <User className="h-3 w-3 mr-1" />
                        First Name
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert customer's first name</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("{lastName}")}
                        className="text-xs h-8"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Last Name
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert customer's last name</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("{email}")}
                        className="text-xs h-8"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert customer's email</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("{phone}")}
                        className="text-xs h-8"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Phone
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert customer's phone number</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="messageBody" className="flex items-center gap-2 text-sm font-medium">
                  Message Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  ref={textareaRef}
                  id="messageBody"
                  placeholder="Hi {firstName}, welcome to our service! We're excited to have you on board."
                  value={formData.messageBody}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, messageBody: e.target.value }));
                    if (errors.messageBody) setErrors(prev => ({ ...prev, messageBody: "" }));
                  }}
                  rows={5}
                  className={`resize-none min-h-[120px] ${errors.messageBody ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {errors.messageBody && (
                  <p className="text-sm text-red-600 mt-1">{errors.messageBody}</p>
                )}
              </div>

              {/* Live Preview */}
              {formData.messageBody && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    Preview
                  </Label>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm leading-relaxed">{getPreviewMessage(formData.messageBody)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                    Make this template public
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Public templates are available to all users in your organization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.messageBody.trim()}
              className="flex-1 h-11"
            >
              {isSubmitting ? (
                <>Creating...</>
              ) : (
                <>Create Template</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}