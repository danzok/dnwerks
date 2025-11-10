"use client";

import { useState, useEffect } from "react";
import { X, Users, Calendar, MessageSquare, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign, Customer } from "@/lib/schema";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Partial<Campaign>) => Promise<void>;
}

interface FormData {
  name: string;
  messageBody: string;
  status: "draft" | "scheduled";
  scheduledAt: string;
  selectedCustomers: string[];
}

export function CreateCampaignModal({ isOpen, onClose, onSave }: CreateCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    messageBody: "",
    status: "draft",
    scheduledAt: "",
    selectedCustomers: [],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock customers for demonstration
  const mockCustomers: Customer[] = [
    {
      id: "1",
      user_id: "demo-user-id",
      first_name: "John",
      last_name: "Doe",
      phone: "5551234567",
      email: "john@example.com",
      status: "active",
      state: "NY",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "demo-user-id",
      first_name: "Jane",
      last_name: "Smith",
      phone: "5559876543",
      email: "jane@example.com",
      status: "active",
      state: "CA",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        name: "",
        messageBody: "",
        status: "draft",
        scheduledAt: "",
        selectedCustomers: [],
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Campaign name is required";
      }
    }

    if (step === 2) {
      if (!formData.messageBody.trim()) {
        newErrors.messageBody = "Message body is required";
      }
      if (formData.messageBody.length > 1600) {
        newErrors.messageBody = "Message must be less than 1600 characters";
      }
    }

    if (step === 3 && formData.status === "scheduled") {
      if (!formData.scheduledAt) {
        newErrors.scheduledAt = "Scheduled date and time are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const campaignData: Partial<Campaign> = {
        name: formData.name,
        message_body: formData.messageBody,
        status: formData.status,
        total_recipients: formData.selectedCustomers.length,
        scheduled_at: formData.status === "scheduled" ? new Date(formData.scheduledAt).toISOString() : null,
      };

      await onSave(campaignData);
      onClose();
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      messageBody: formData.messageBody + `{{${variable}}}`,
    });
  };

  const toggleCustomerSelection = (customerId: string) => {
    setFormData({
      ...formData,
      selectedCustomers: formData.selectedCustomers.includes(customerId)
        ? formData.selectedCustomers.filter(id => id !== customerId)
        : [...formData.selectedCustomers, customerId],
    });
  };

  const selectAllCustomers = () => {
    if (formData.selectedCustomers.length === mockCustomers.length) {
      setFormData({ ...formData, selectedCustomers: [] });
    } else {
      setFormData({
        ...formData,
        selectedCustomers: mockCustomers.map(c => c.id),
      });
    }
  };

  const steps = [
    { number: 1, title: "Campaign Details", icon: MessageSquare },
    { number: 2, title: "Message Content", icon: MessageSquare },
    { number: 3, title: "Schedule", icon: Calendar },
    { number: 4, title: "Review", icon: Eye },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 mx-4 ${
                    currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Campaign Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome Series, Holiday Special"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Campaign Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use descriptive names to easily identify campaigns</li>
                  <li>• Include the target audience or purpose in the name</li>
                  <li>• Keep names under 50 characters for better readability</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Message Content */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="messageBody">Message Body *</Label>
                <div className="text-xs text-gray-500 mb-2">
                  Use variables to personalize messages: {`{{firstName}}`}, {`{{lastName}}`}, {`{{phone}}`}
                </div>
                <Textarea
                  id="messageBody"
                  value={formData.messageBody}
                  onChange={(e) => setFormData({ ...formData, messageBody: e.target.value })}
                  placeholder="Type your message here..."
                  className={`min-h-32 ${errors.messageBody ? "border-red-500" : ""}`}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {formData.messageBody.length}/1600 characters
                  </span>
                  {errors.messageBody && (
                    <p className="text-sm text-red-600">{errors.messageBody}</p>
                  )}
                </div>
              </div>

              {/* Variable Insertion */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Insert Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["firstName", "lastName", "phone", "email"].map((variable) => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                    >
                      {`{{${variable}}}`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Preview</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <div className="bg-gray-100 rounded-lg p-3 min-h-20 whitespace-pre-wrap">
                      {formData.messageBody || "Your message will appear here..."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Campaign Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "scheduled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="scheduled">Schedule Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === "scheduled" && (
                <div>
                  <Label htmlFor="scheduledAt">Schedule Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className={errors.scheduledAt ? "border-red-500" : ""}
                  />
                  {errors.scheduledAt && (
                    <p className="text-sm text-red-600">{errors.scheduledAt}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Campaign will be sent at the specified time
                  </p>
                </div>
              )}

              {/* Customer Selection */}
              <div>
                <Label>Target Customers</Label>
                <div className="flex items-center justify-between mt-2 mb-2">
                  <span className="text-sm text-gray-500">
                    {formData.selectedCustomers.length} of {mockCustomers.length} customers selected
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllCustomers}
                  >
                    {formData.selectedCustomers.length === mockCustomers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {mockCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCustomerSelection(customer.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedCustomers.includes(customer.id)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <span className="text-sm">
                        {customer.first_name} {customer.last_name} - {customer.phone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Campaign Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge variant="outline">{formData.status}</Badge>
                      </div>
                      {formData.scheduledAt && (
                        <div>
                          <span className="text-sm text-gray-500">Scheduled:</span>
                          <p className="font-medium">
                            {new Date(formData.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Target Audience</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold">
                            {formData.selectedCustomers.length}
                          </span>
                          <p className="text-sm text-gray-500">customers selected</p>
                        </div>
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-2">Message Preview</h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-gray-100 rounded-lg p-3 whitespace-pre-wrap">
                      {formData.messageBody}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || formData.selectedCustomers.length === 0}
              >
                {isSubmitting
                  ? "Creating..."
                  : formData.status === "draft"
                  ? "Save Draft"
                  : "Schedule Campaign"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}