"use client"

import { useState } from "react"
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  UserPlus, 
  Eye,
  X,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { processPhoneNumber } from "@/lib/utils/phone"
import { useUser } from "@/lib/auth"

interface ImportResult {
  imported: number
  skipped: number
  total: number
  errors?: string[]
  hasMoreErrors?: boolean
}

interface Customer {
  phone: string
  firstName: string
  lastName: string
  email: string
  company: string
}

interface PreviewCustomer extends Customer {
  isValid: boolean
  error?: string
  isDuplicate?: boolean
  formattedPhone?: string
  state?: string
}

export default function ImportContactsPage() {
  // Authentication
  const { user, isLoaded } = useUser()

  // CSV Import State
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  // Manual Entry State
  const [manualCustomer, setManualCustomer] = useState<Customer>({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  })
  
  // Preview State
  const [previewCustomers, setPreviewCustomers] = useState<PreviewCustomer[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Loading check
  if (!isLoaded) {
    return (
      <SidebarProvider>
        <ClientSafeSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Auth check
  if (!user) {
    return (
      <SidebarProvider>
        <ClientSafeSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Please sign in to access this page</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        toast.error("Please select a CSV file")
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB")
        return
      }
      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      const text = await file.text()
      
      // Parse CSV
      const lines = text.split('\n').map(line => line.trim()).filter(line => line)
      if (lines.length < 2) {
        toast.error("CSV file must have header row and at least one data row")
        setIsUploading(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const customers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const customer: any = {}
        
        // Map CSV columns to customer fields
        headers.forEach((header, index) => {
          const value = values[index] || ''
          const lowerHeader = header.toLowerCase()
          
          if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            customer.firstName = value
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            customer.lastName = value
          } else if (lowerHeader.includes('email')) {
            customer.email = value
          } else if (lowerHeader.includes('phone')) {
            customer.phone = value
          } else if (lowerHeader.includes('company')) {
            customer.company = value
          }
        })
        
        return customer
      })

      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Import failed')
      }

      const result = await response.json()
      setImportResult(result)
      
      if (result.skipped > 0) {
        toast.success(`Import completed! ${result.imported} imported, ${result.skipped} duplicates skipped`)
      } else {
        toast.success(`Successfully imported ${result.imported} customers`)
      }

      // Trigger a storage event to notify other tabs/pages about the update
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'customers_updated',
        newValue: Date.now().toString()
      }))

    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsUploading(false)
    }
  }

  // Manual Entry Handlers
  const handleManualInputChange = (field: keyof Customer, value: string) => {
    setManualCustomer(prev => ({ ...prev, [field]: value }))
  }

  const addToPreview = async () => {
    if (!manualCustomer.phone.trim()) {
      toast.error("Phone number is required")
      return
    }

    const phoneResult = processPhoneNumber(manualCustomer.phone)
    
    const previewCustomer: PreviewCustomer = {
      ...manualCustomer,
      isValid: phoneResult.isValid,
      error: phoneResult.error,
      formattedPhone: phoneResult.formatted,
      state: phoneResult.state || undefined
    }

    // Check for duplicates in preview list
    const isDuplicateInPreview = previewCustomers.some(
      customer => customer.formattedPhone === phoneResult.formatted
    )

    if (isDuplicateInPreview) {
      toast.error("Customer already exists in preview list")
      return
    }

    setPreviewCustomers(prev => [...prev, previewCustomer])
    
    // Reset form
    setManualCustomer({
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      company: ''
    })
    
    toast.success("Customer added to preview")
  }

  const removeFromPreview = (index: number) => {
    setPreviewCustomers(prev => prev.filter((_, i) => i !== index))
  }

  const clearPreview = () => {
    setPreviewCustomers([])
  }

  const validateAndSubmitPreview = async () => {
    if (previewCustomers.length === 0) {
      toast.error("No customers to import")
      return
    }

    const validCustomers = previewCustomers.filter(customer => customer.isValid)
    
    if (validCustomers.length === 0) {
      toast.error("No valid customers to import")
      return
    }

    setIsProcessing(true)

    try {
      const customers = validCustomers.map(customer => ({
        phone: customer.formattedPhone!,
        firstName: customer.firstName || null,
        lastName: customer.lastName || null,
        email: customer.email || null,
        company: customer.company || null,
        state: customer.state || null
      }))

      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Import failed')
      }

      const result = await response.json()
      setImportResult(result)
      
      if (result.skipped > 0) {
        toast.success(`Import completed! ${result.imported} imported, ${result.skipped} duplicates skipped`)
      } else {
        toast.success(`Successfully imported ${result.imported} customers`)
      }

      // Clear preview after successful import
      setPreviewCustomers([])

      // Trigger a storage event to notify other tabs/pages about the update
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'customers_updated',
        newValue: Date.now().toString()
      }))

    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const validPreviewCount = previewCustomers.filter(c => c.isValid).length
  const invalidPreviewCount = previewCustomers.filter(c => !c.isValid).length

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1">
          <div className="container max-w-6xl mx-auto space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard/customers">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Import Customers</h1>
                <p className="text-muted-foreground max-w-2xl">Upload CSV files to bulk import customers or add them manually with preview functionality</p>
              </div>
            </div>

            {/* Import Results Alert */}
            {importResult && (
              <Alert className="border-green-200 bg-green-50 border">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Import Complete</AlertTitle>
                <AlertDescription className="text-green-800">
                  Successfully imported <span className="font-semibold">{importResult.imported}</span> customers.
                  {importResult.skipped > 0 && (
                    <span>
                      {" "}<span className="font-semibold">{importResult.skipped}</span> duplicates were automatically skipped.
                    </span>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="font-medium">Errors found:</p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.hasMoreErrors && (
                          <li className="text-muted-foreground">
                            ...and {importResult.errors!.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  CSV Import
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="mt-8">
                <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
                  {/* Upload Card */}
                  <Card className="h-fit">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Upload className="h-5 w-5 text-blue-600" />
                        Upload CSV
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="csv-file" className="text-sm font-medium">Choose CSV file</Label>
                        <Input
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>
                      
                      {file && (
                        <Alert className="border-green-200 bg-green-50 border">
                          <FileText className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-sm text-green-800">
                            Ready to import: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        size="default"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Import Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Instructions Card */}
                  <Card className="h-fit">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5 text-blue-600" />
                        Format Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <Alert className="border-blue-200 bg-blue-50 border">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm leading-relaxed text-blue-800">
                          <strong>Duplicate Detection:</strong> Phone numbers already in your database will be automatically skipped to prevent duplicates.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Required columns:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                          <li>• Phone (required)</li>
                          <li>• First Name, Last Name, Email, Company (optional)</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg border">
                        <p className="text-sm font-medium mb-2">Example CSV format:</p>
                        <code className="text-xs text-muted-foreground block leading-relaxed font-mono">
                          Phone,FirstName,LastName,Email<br/>
                          5551234567,John,Doe,john@example.com<br/>
                          2125551234,Jane,Smith,jane@example.com
                        </code>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Maximum file size: 10MB • Up to 2,000 customers per import
                      </p>
                    </CardContent>
                  </Card>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-8">
              <div className="grid gap-6 xl:grid-cols-5 lg:grid-cols-3">
                {/* Manual Entry Form */}
                <Card className="xl:col-span-2 lg:col-span-1 h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserPlus className="h-5 w-5 text-green-600" />
                      Add Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={manualCustomer.phone}
                        onChange={(e) => handleManualInputChange('phone', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={manualCustomer.firstName}
                          onChange={(e) => handleManualInputChange('firstName', e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={manualCustomer.lastName}
                          onChange={(e) => handleManualInputChange('lastName', e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={manualCustomer.email}
                        onChange={(e) => handleManualInputChange('email', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                      <Input
                        id="company"
                        placeholder="Acme Corp"
                        value={manualCustomer.company}
                        onChange={(e) => handleManualInputChange('company', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <Button 
                      onClick={addToPreview} 
                      className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-medium"
                      disabled={!manualCustomer.phone.trim()}
                      size="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Preview
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview List */}
                <Card className="xl:col-span-3 lg:col-span-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Eye className="h-5 w-5 text-purple-600" />
                        Preview ({previewCustomers.length})
                      </CardTitle>
                      {previewCustomers.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {validPreviewCount > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 px-2 py-1">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {validPreviewCount} Valid
                              </Badge>
                            )}
                            {invalidPreviewCount > 0 && (
                              <Badge variant="destructive" className="px-2 py-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {invalidPreviewCount} Invalid
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearPreview}
                            className="h-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {previewCustomers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No customers in preview</p>
                        <p className="text-sm leading-relaxed max-w-sm mx-auto">Add customers manually to preview before importing to database</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                          {previewCustomers.map((customer, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border ${
                                customer.isValid 
                                  ? 'border-green-200 bg-green-50' 
                                  : 'border-red-200 bg-red-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-sm truncate">
                                      {customer.formattedPhone || customer.phone}
                                    </span>
                                    {customer.state && (
                                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                                        {customer.state}
                                      </Badge>
                                    )}
                                    {customer.isValid ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground leading-relaxed">
                                    {customer.firstName || customer.lastName ? (
                                      <span className="font-medium">{customer.firstName} {customer.lastName}</span>
                                    ) : (
                                      <span className="italic">No name</span>
                                    )}
                                    {customer.email && (
                                      <span className="ml-2">• {customer.email}</span>
                                    )}
                                    {customer.company && (
                                      <span className="ml-2">• {customer.company}</span>
                                    )}
                                  </div>

                                  {customer.error && (
                                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                                      {customer.error}
                                    </p>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromPreview(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={clearPreview}
                            size="sm"
                            className="h-9 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                          <Button
                            onClick={validateAndSubmitPreview}
                            disabled={isProcessing || validPreviewCount === 0}
                            size="sm"
                            className="h-9 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Import {validPreviewCount} Customer{validPreviewCount !== 1 ? 's' : ''}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}