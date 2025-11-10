"use client"

import { useState, useRef } from "react"
import { useUser } from "@/lib/auth"
import Papa from "papaparse"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Upload, CheckCircle, AlertCircle, Download } from "lucide-react"
import { processPhoneNumber } from "@/lib/utils/phone"
import { toast } from "sonner"

interface ImportCsvModalProps {
  open: boolean
  onClose: () => void
}

interface CsvRow {
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  isValid: boolean
  formatted?: string
  state?: string | null
  error?: string
}

export function ImportCsvModal({ open, onClose }: ImportCsvModalProps) {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [fileName, setFileName] = useState("")

  const downloadTemplate = () => {
    const template = `phone,firstName,lastName,email
2025551234,John,Doe,john@example.com
2125552345,Jane,Smith,jane@example.com
2135553456,Bob,Johnson,bob@example.com`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Template downloaded! Fill it out and upload it back.')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('File is too large. Please keep it under 2MB.')
      return
    }

    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file. Please check the format.')
          console.error('CSV parsing errors:', results.errors)
          return
        }

        const data = results.data as any[]
        
        if (data.length === 0) {
          toast.error('CSV file is empty')
          return
        }

        if (data.length > 2000) {
          toast.error('CSV file too large. Maximum 2,000 contacts per import.')
          return
        }

        // Validate required phone column
        const hasPhoneColumn = results.meta.fields?.includes('phone')
        if (!hasPhoneColumn) {
          toast.error('CSV must have a "phone" column')
          return
        }

        // Process each row
        const processedData: CsvRow[] = data.map((row, index) => {
          const phone = row.phone?.toString().trim() || ''
          
          if (!phone) {
            return {
              phone: '',
              firstName: row.firstName?.toString().trim() || '',
              lastName: row.lastName?.toString().trim() || '',
              email: row.email?.toString().trim() || '',
              isValid: false,
              error: `Row ${index + 1}: Missing phone number`
            }
          }

          const phoneResult = processPhoneNumber(phone)
          
          return {
            phone,
            firstName: row.firstName?.toString().trim() || '',
            lastName: row.lastName?.toString().trim() || '',
            email: row.email?.toString().trim() || '',
            isValid: phoneResult.isValid,
            formatted: phoneResult.formatted,
            state: phoneResult.state,
            error: phoneResult.isValid ? undefined : phoneResult.error
          }
        })

        setCsvData(processedData)
        setShowPreview(true)
      },
      error: (error) => {
        toast.error('Failed to read CSV file')
        console.error('CSV reading error:', error)
      }
    })
  }

  const handleImport = async () => {
    if (!user) return

    const validRows = csvData.filter(row => row.isValid)
    
    if (validRows.length === 0) {
      toast.error("No valid contacts to import")
      return
    }

    setLoading(true)

    try {
      const customersData = validRows.map(row => ({
        phone: row.formatted!,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        email: row.email || null,
        state: row.state
      }))

      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: customersData })
      })

      if (!response.ok) {
        throw new Error('Failed to import customers')
      }

      const result = await response.json()
      
      toast.success(`Import completed! ${result.imported} customers imported, ${result.skipped} duplicates skipped.`)

      // Reset form
      setCsvData([])
      setShowPreview(false)
      setFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Close modal
      onClose()
      
      // Refresh the page
      window.location.reload()

    } catch (error) {
      console.error('Error importing customers:', error)
      toast.error('Failed to import customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validCount = csvData.filter(row => row.isValid).length
  const invalidCount = csvData.filter(row => !row.isValid).length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with customer data. Maximum 2,000 contacts per import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!showPreview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Required columns: <code>phone</code>. Optional: <code>firstName</code>, <code>lastName</code>, <code>email</code>
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Example:</h4>
                <pre className="text-sm font-mono bg-background p-2 rounded border">
{`phone,firstName,lastName,email
2025551234,John,Doe,john@example.com
212-555-2345,Jane,Smith,jane@example.com
+1 (213) 555-3456,Bob,Johnson,`}
                </pre>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {csvData.length} total rows
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{validCount} Valid</span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">{invalidCount} Invalid</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-md max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 100).map((row, index) => ( // Show first 100 rows
                      <TableRow key={index}>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {row.isValid ? row.formatted : row.phone}
                          {row.error && (
                            <p className="text-xs text-destructive mt-1">{row.error}</p>
                          )}
                        </TableCell>
                        <TableCell>{row.firstName || '—'}</TableCell>
                        <TableCell>{row.lastName || '—'}</TableCell>
                        <TableCell>{row.email || '—'}</TableCell>
                        <TableCell>
                          {row.state ? (
                            <Badge variant="outline">{row.state}</Badge>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 100 && (
                  <div className="p-4 text-center text-sm text-muted-foreground border-t">
                    Showing first 100 rows of {csvData.length} total
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                >
                  Choose Different File
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={loading || validCount === 0}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {validCount} Customer{validCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}