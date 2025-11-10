"use client"

import { useState } from "react"
import { useUser } from "@/lib/auth"

// Helper function to add mock auth headers in development
const getAuthHeaders = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return {
      'Content-Type': 'application/json',
      'x-mock-auth': 'development'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatPhoneDisplay } from "@/lib/utils/phone"

interface Customer {
  id: string
  phone: string
  firstName: string | null
  lastName: string | null
  email: string | null
  state: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface DeleteCustomerDialogProps {
  customer: Customer
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteCustomerDialog({ customer, open, onClose, onSuccess }: DeleteCustomerDialogProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const customerName = customer.firstName || customer.lastName 
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    : 'Unnamed customer'

  const handleDelete = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: Object.fromEntries(
          Object.entries(getAuthHeaders()).filter(([_, value]) => value !== undefined)
        )
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }
      
      toast.success('Customer deleted successfully!')
      onSuccess()
      
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="font-medium">{customerName}</div>
                <div className="font-mono text-sm text-muted-foreground">
                  {formatPhoneDisplay(customer.phone)}
                </div>
                {customer.email && (
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Any campaign messages sent to this customer will remain in your records,
                but future campaigns will not include this contact.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Customer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}