"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Users } from "lucide-react"
import { AddCustomerModal } from "./add-customer-modal"
import { BulkAddModal } from "./bulk-add-modal"
import { ImportCsvModal } from "./import-csv-modal"

export function CustomersHeader() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Manage your customer contacts and phone numbers
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowBulkModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Add
          </Button>
          
          <Button 
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      <AddCustomerModal 
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      <BulkAddModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />
      
      <ImportCsvModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </>
  )
}