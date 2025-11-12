"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building,
  MapPin 
} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  error?: string
  onDeleteContact?: (id: string) => void
}

// Helper function to render status badges - moved outside component scope
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <Badge variant="success">Active</Badge>
    case 'paused':
      return <Badge variant="warning">Paused</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function VercelDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error,
  onDeleteContact,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] rounded-xl overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-[#666666] dark:text-[#888888]">Loading contacts...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-[#EE0000] dark:text-[#FF6B6B]">Error: {error}</div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl font-bold font-mono text-[#999999] dark:text-[#666666] mb-4">0</div>
            <div className="text-sm text-[#666666] dark:text-[#888888]">No contacts found</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-2">
              Try adjusting your search or filters to find contacts
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-[#EAEAEA] dark:border-[#333333]">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const contact = row.original as any
                  return (
                    <TableRow 
                      key={row.id} 
                      className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="text-sm text-[#666666] dark:text-[#888888]">No contacts found</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// Enhanced column definitions with Vercel styling
export const createContactColumns = (onDeleteContact?: (id: string) => void): ColumnDef<any>[] => [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return getStatusBadge(status)
    },
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string
      const lastName = row.original.lastName as string
      const email = row.original.email as string
      const phone = row.original.phone as string
      
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm text-black dark:text-white">
            {firstName && lastName ? `${firstName} ${lastName}` : (email || phone)}
          </div>
          {(email || phone) && (
            <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#888888]">
              {email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="text-sm text-[#666666] dark:text-[#888888]">
          {email || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return (
        <div className="text-sm text-[#666666] dark:text-[#888888]">
          {phone || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => {
      const company = row.getValue("company") as string
      return (
        <div className="text-sm text-[#666666] dark:text-[#888888]">
          {company || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => {
      const state = row.getValue("state") as string
      return (
        <div className="text-sm text-[#666666] dark:text-[#888888]">
          {state || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as Date)
      return (
        <div className="text-sm text-[#666666] dark:text-[#888888]">
          {date.toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const contact = row.original
      
      return (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-[#666666] dark:text-[#888888] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] shadow-lg">
              <DropdownMenuItem
                onClick={() => {
                  // Edit contact logic here
                  console.log('Edit contact:', contact.id)
                }}
                className="text-black dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] focus:bg-[#EAEAEA] dark:focus:bg-[#333333]"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#EAEAEA] dark:bg-[#333333]" />
              <DropdownMenuItem
                onClick={() => {
                  // Delete contact logic here
                  if (onDeleteContact) {
                    onDeleteContact(contact.id)
                  }
                }}
                className="text-[#EE0000] dark:text-[#FF6B6B] hover:bg-[#FFEEEE] dark:hover:bg-[#2A0A0A] focus:bg-[#FFCCCC] dark:focus-bg-[#4A0A0A]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// Export a factory function that creates columns with the delete handler
export const contactColumns = createContactColumns()