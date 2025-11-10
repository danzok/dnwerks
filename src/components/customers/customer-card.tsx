"use client";

import { useState } from "react";
import { MoreHorizontal, Phone, Mail, MapPin, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/lib/schema";
import { formatPhoneDisplay } from "@/lib/utils/phone";

interface CustomerCardProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setIsDeleting(true);
      try {
        await onDelete(customer.id);
      } catch (error) {
        console.error("Failed to delete customer:", error);
        setIsDeleting(false);
      }
    }
  };

  
  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {customer.first_name && customer.last_name
                ? `${customer.first_name} ${customer.last_name}`
                : customer.first_name || customer.last_name || "Unnamed Customer"
              }
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {customer.status}
              </span>
              {customer.state && (
                <span className="text-sm text-gray-500">
                  {customer.state}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <a
              href={`tel:${customer.phone}`}
              className="hover:text-blue-600 transition-colors"
            >
              {formatPhoneDisplay(customer.phone)}
            </a>
          </div>

          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${customer.email}`}
                className="hover:text-blue-600 transition-colors"
              >
                {customer.email}
              </a>
            </div>
          )}

          {customer.state && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>United States</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Added {new Date(customer.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}