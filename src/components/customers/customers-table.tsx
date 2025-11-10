"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { EditCustomerModal } from "./edit-customer-modal"
import { DeleteCustomerDialog } from "./delete-customer-dialog"
import { formatPhoneDisplay } from "@/lib/utils/phone"
import { formatDate } from "@/lib/utils/date"

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

const ITEMS_PER_PAGE = 50

export function CustomersTable() {
  const { user } = useUser()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  // Get filter from URL
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")

  // Fetch customers
  useEffect(() => {
    console.log("📊 CustomersTable useEffect triggered")
    console.log("📊 User object:", user)
    console.log("📊 User loaded:", user ? "Yes" : "No")
    
    if (!user) {
      console.log("📊 No user, returning early")
      return
    }

    const fetchCustomers = async () => {
      try {
        console.log("📊 Starting fetch customers...")
        const response = await fetch("/api/customers")
        console.log("📊 Response status:", response.status)
        if (response.ok) {
          const data = await response.json()
          console.log("📊 Customers data:", data)
          console.log("📊 Number of customers:", data.length)
          setCustomers(data)
        } else {
          console.error("📊 Failed to fetch customers, status:", response.status)
          const errorText = await response.text()
          console.error("📊 Error response:", errorText)
        }
      } catch (error) {
        console.error("📊 Failed to fetch customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [user])

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = searchQuery === "" || 
        customer.phone.includes(searchQuery) ||
        customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesState = stateFilter === "all" || customer.state === stateFilter

      // Apply URL filter parameter
      let matchesFilter = true
      if (filterParam) {
        const customerDate = new Date(customer.createdAt)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        switch (filterParam) {
          case "active":
            matchesFilter = customer.status === "active"
            break
          case "inactive":
            matchesFilter = customer.status === "inactive"
            break
          case "recent":
            matchesFilter = customerDate > sevenDaysAgo
            break
          case "no-email":
            matchesFilter = !customer.email || customer.email.trim() === ""
            break
          default:
            matchesFilter = true
        }
      }

      return matchesSearch && matchesState && matchesFilter
    })
  }, [customers, searchQuery, stateFilter, filterParam])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Get unique states for filter
  const availableStates = useMemo(() => {
    const states = new Set(customers.map(c => c.state).filter(Boolean))
    return Array.from(states).sort()
  }, [customers])

  // Handle customer refresh after edit/delete
  const refreshCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to refresh customers:", error)
    }
  }

  if (loading) {
    return <div>Loading customers...</div>
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">All States</SelectItem>
            {availableStates.filter(Boolean).map(state => (
              <SelectItem key={state} value={state!} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
        
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length.toLocaleString()} customers
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border lg:rounded-xl lg:p-1 lg:bg-gradient-to-b lg:from-background lg:to-muted/20">
        <Table className="lg:[&_th]:py-3 lg:[&_td]:py-3 lg:[&_th]:text-sm lg:[&_td]:align-middle">
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchQuery || stateFilter !== "all" 
                    ? "No customers found matching your filters."
                    : "No customers yet. Add your first contact to get started."
                  }
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono">
                    {formatPhoneDisplay(customer.phone)}
                  </TableCell>
                  <TableCell>
                    {customer.firstName || customer.lastName 
                      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.email || '—'}
                  </TableCell>
                  <TableCell>
                    {customer.state ? (
                      <Badge variant="outline">{customer.state}</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={customer.status === 'active' ? 'default' : 'secondary'}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingCustomer(customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingCustomer(customer)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber = i + 1
                
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          open={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSuccess={refreshCustomers}
        />
      )}

      {deletingCustomer && (
        <DeleteCustomerDialog
          customer={deletingCustomer}
          open={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onSuccess={refreshCustomers}
        />
      )}
    </div>
  )
}