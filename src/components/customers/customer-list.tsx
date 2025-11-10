"use client";

import { useState } from "react";
import { Plus, Search, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerCard } from "./customer-card";
import { CustomerModal } from "./customer-modal";
import { ImportModal } from "./import-modal";
import { useCustomers } from "@/hooks/use-customers";

export function CustomerList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers
  } = useCustomers(searchQuery);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["FirstName", "LastName", "Phone", "Email", "State", "Status", "Created"];
    const csvContent = [
      headers.join(","),
      ...customers.map(customer => [
        customer.first_name || "",
        customer.last_name || "",
        customer.phone,
        customer.email || "",
        customer.state || "",
        customer.status,
        customer.created_at
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div>Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={customers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {customers.length}
          </div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {customers.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-400">
            {customers.filter(c => c.status === 'inactive').length}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

      {/* Customer Grid */}
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No customers found</div>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Try adjusting your search" : "Add your first customer to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Customer
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={() => setShowCreateModal(true)}
              onDelete={deleteCustomer}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={createCustomer}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importCustomers}
      />
    </div>
  );
}