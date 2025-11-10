"use client"

import { useState } from "react"
import { useUser } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { processPhoneNumber } from "@/lib/utils/phone"
import { toast } from "sonner"

interface BulkAddModalProps {
  open: boolean
  onClose: () => void
}

interface ProcessedPhone {
  original: string
  formatted?: string
  state?: string | null
  isValid: boolean
  error?: string
}

export function BulkAddModal({ open, onClose }: BulkAddModalProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState("")
  const [processedPhones, setProcessedPhones] = useState<ProcessedPhone[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const processPhoneNumbers = () => {
    if (!phoneNumbers.trim()) {
      toast.error("Please enter some phone numbers")
      return
    }

    // Split by line breaks and commas, then clean up
    const phones = phoneNumbers
      .split(/[\n,]/)
      .map(phone => phone.trim())
      .filter(phone => phone.length > 0)

    if (phones.length === 0) {
      toast.error("No valid phone numbers found")
      return
    }

    if (phones.length > 100) {
      toast.error("Please add no more than 100 phone numbers at once")
      return
    }

    // Process each phone number
    const processed = phones.map(phone => {
      const result = processPhoneNumber(phone)
      return {
        original: phone,
        formatted: result.formatted,
        state: result.state,
        isValid: result.isValid,
        error: result.error
      }
    })

    setProcessedPhones(processed)
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    if (!user) return

    const validPhones = processedPhones.filter(p => p.isValid)
    
    if (validPhones.length === 0) {
      toast.error("No valid phone numbers to add")
      return
    }

    setLoading(true)

    try {
      const customersData = validPhones.map(phone => ({
        phone: phone.formatted!,
        firstName: null,
        lastName: null,
        email: null,
        state: phone.state
      }))

      const response = await fetch('/api/customers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: customersData })
      })

      if (!response.ok) {
        throw new Error('Failed to add customers')
      }

      const result = await response.json()
      
      toast.success(`${result.added} customers added successfully! ${result.skipped} duplicates skipped.`)

      // Reset form
      setPhoneNumbers("")
      setProcessedPhones([])
      setShowPreview(false)
      
      // Close modal
      onClose()
      
      // Refresh the page
      window.location.reload()

    } catch (error) {
      console.error('Error adding customers:', error)
      toast.error('Failed to add customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validCount = processedPhones.filter(p => p.isValid).length
  const invalidCount = processedPhones.filter(p => !p.isValid).length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Add Customers</DialogTitle>
          <DialogDescription>
            Enter multiple phone numbers (one per line or comma-separated). Names and emails can be added later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!showPreview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumbers">Phone Numbers</Label>
                <Textarea
                  id="phoneNumbers"
                  placeholder={`Enter phone numbers like:
2025551234
212-555-2345
+1 (213) 555-3456
310.555.4567

Or comma-separated: 2025551234, 2125552345, 2135553456`}
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  ✓ Auto-detect state from area code • ✓ Skip duplicates automatically • ✓ US numbers only
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={processPhoneNumbers}>
                  Preview & Validate
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
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

              <div className="space-y-2 max-h-[300px] overflow-auto">
                {processedPhones.map((phone, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      phone.isValid 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-mono text-sm">
                        {phone.original}
                        {phone.isValid && phone.formatted && (
                          <span className="ml-2 text-muted-foreground">
                            → {phone.formatted}
                          </span>
                        )}
                      </div>
                      {phone.error && (
                        <p className="text-xs text-red-600 mt-1">{phone.error}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {phone.state && (
                        <Badge variant="outline" className="text-xs">
                          {phone.state}
                        </Badge>
                      )}
                      {phone.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                >
                  Back to Edit
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || validCount === 0}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add {validCount} Customer{validCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}