"use client";

import { useState, useCallback } from "react";
import { Upload, X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from "@/lib/schema";
import { processPhoneNumber } from "@/lib/utils/phone";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (customers: Partial<Customer>[]) => Promise<void>;
}

interface ParsedCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status?: "active" | "inactive";
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedCustomers, setParsedCustomers] = useState<ParsedCustomer[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = "FirstName,LastName,Phone,Email,Status\nJohn,Doe,(555) 123-4567,john@example.com,active\nJane,Smith,(555) 987-6543,jane@example.com,active";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customer_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSV = useCallback((text: string): ParsedCustomer[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header and one data row");
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const firstNameIndex = headers.findIndex(h => h === 'firstname');
    const lastNameIndex = headers.findIndex(h => h === 'lastname');
    const phoneIndex = headers.findIndex(h => h === 'phone');
    const emailIndex = headers.findIndex(h => h === 'email');
    const statusIndex = headers.findIndex(h => h === 'status');

    if (firstNameIndex === -1 || lastNameIndex === -1 || phoneIndex === -1) {
      throw new Error("CSV must contain 'FirstName', 'LastName', and 'Phone' columns");
    }

    const customers: ParsedCustomer[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

      const firstName = values[firstNameIndex];
      const lastName = values[lastNameIndex];
      const phone = values[phoneIndex];
      const email = emailIndex !== -1 ? values[emailIndex] : undefined;
      const status = statusIndex !== -1 ? values[statusIndex] as "active" | "inactive" : "active";

      if (!firstName || !lastName || !phone) {
        continue; // Skip empty rows
      }

      customers.push({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email?.trim() || undefined,
        status: (status === "active" || status === "inactive") ? status : "active"
      });
    }

    if (customers.length === 0) {
      throw new Error("No valid customer data found in CSV");
    }

    return customers;
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setParseError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setIsParsing(true);

    try {
      const text = await selectedFile.text();
      const customers = parseCSV(text);
      setParsedCustomers(customers);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse CSV file");
      setParsedCustomers([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (parsedCustomers.length === 0) return;

    setIsImporting(true);
    try {
      // Convert to Customer format
      const customersToImport: Partial<Customer>[] = parsedCustomers.map(customer => {
        // Use centralized phone processing
        const phoneResult = processPhoneNumber(customer.phone);
        if (!phoneResult.isValid) {
          throw new Error(`Invalid phone number: ${customer.phone} - ${phoneResult.error}`);
        }

        return {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: phoneResult.formatted!,
          email: customer.email,
          status: customer.status || "active",
          state: phoneResult.state,
        };
      });

      await onImport(customersToImport);
      onClose();
      setFile(null);
      setParsedCustomers([]);
    } catch (error) {
      setParseError("Failed to import customers. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onClose();
      setFile(null);
      setParsedCustomers([]);
      setParseError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">CSV Template</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Download our template to ensure your data is formatted correctly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to select a CSV file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports .csv files only
                  </p>
                </label>
              </div>
            </div>

            {parseError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{parseError}</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {parsedCustomers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">
                Preview ({parsedCustomers.length} customers found)
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          First Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedCustomers.slice(0, 10).map((customer, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {customer.firstName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {customer.lastName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {customer.phone}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {customer.email || "-"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                customer.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {customer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {parsedCustomers.length > 10 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                            ... and {parsedCustomers.length - 10} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={parsedCustomers.length === 0 || isImporting}
            >
              {isImporting ? "Importing..." : `Import ${parsedCustomers.length} Customers`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}