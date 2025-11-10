"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from "@/lib/schema";
import { processPhoneNumber, formatPhoneDisplay } from "@/lib/utils/phone";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => Promise<void>;
  customer?: Customer;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedState, setDetectedState] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        phone: customer.phone,
        email: customer.email || "",
        status: customer.status as "active" | "inactive",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        status: "active",
      });
    }
    setErrors({});
    setDetectedState(null);
  }, [customer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim() && !formData.lastName.trim()) {
      newErrors.firstName = "First name or last name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Use centralized phone validation
      const phoneResult = processPhoneNumber(formData.phone);
      if (!phoneResult.isValid) {
        newErrors.phone = phoneResult.error || "Please enter a valid US phone number";
      }
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });

    // Detect state from phone number using centralized utility
    const phoneResult = processPhoneNumber(value);
    setDetectedState(phoneResult.state || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Use centralized phone processing
      const phoneResult = processPhoneNumber(formData.phone);
      if (!phoneResult.isValid) {
        throw new Error(phoneResult.error || "Invalid phone number");
      }

      await onSave({
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        phone: phoneResult.formatted!,
        email: formData.email || null,
        status: formData.status,
        state: phoneResult.state || detectedState,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
                className={errors.firstName ? "border-red-500" : ""}
              />
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
                className={errors.firstName ? "border-red-500" : ""}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formatPhoneDisplay(formData.phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
            {detectedState && (
              <p className="text-sm text-green-600">
                Detected: {detectedState}, USA
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="active" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Active</SelectItem>
                <SelectItem value="inactive" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (customer ? "Updating..." : "Creating...")
                : (customer ? "Update Customer" : "Create Customer")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}