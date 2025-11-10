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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { processPhoneNumber } from "@/lib/utils/phone"
import { toast } from "sonner"

interface AddCustomerModalProps {
  open: boolean
  onClose: () => void
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export function AddCustomerModal({ open, onClose }: AddCustomerModalProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    state: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }))
    
    // Auto-detect state from area code
    const phoneResult = processPhoneNumber(value)
    if (phoneResult.isValid && phoneResult.state && !formData.state) {
      setFormData(prev => ({ ...prev, state: phoneResult.state! }))
    }
    
    // Clear phone error if it exists
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate phone (required)
    const phoneResult = processPhoneNumber(formData.phone)
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error || 'Invalid phone number'
    }
    
    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !validateForm()) return
    
    setLoading(true)
    
    try {
      const phoneResult = processPhoneNumber(formData.phone)
      
      const customerData = {
        phone: phoneResult.formatted,
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        email: formData.email.trim() || null,
        state: formData.state || phoneResult.state || null
      }
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          setErrors({ phone: 'This phone number already exists' })
          return
        }
        throw new Error(error.message || 'Failed to create customer')
      }
      
      toast.success('Customer added successfully!')
      
      // Reset form
      setFormData({
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        state: ''
      })
      setErrors({})
      
      // Close modal
      onClose()
      
      // Refresh the page to update the customers table
      window.location.reload()
      
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to add customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer details. Phone number is required for SMS campaigns.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="(202) 555-1234 or +12025551234"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
            <p className="text-xs text-muted-foreground">
              US phone numbers only. We'll auto-detect the state from area code.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detected from area code" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}