"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
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
import { Checkbox } from "@/components/ui/checkbox"
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
  MapPin,
  Tags,
  Trash,
} from "lucide-react"

import { TagInput } from "./tag-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BulkEditDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  selectedCount: number
  onBulkUpdate: (updates: any) => Promise<void>
}

function BulkEditDialog({ isOpen, onClose, selectedIds, selectedCount, onBulkUpdate }: BulkEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    tags: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updates: any = {}

      if (formData.status) {
        updates.status = formData.status
      }

      if (formData.tags.length > 0) {
        updates.tags = formData.tags
      }

      if (Object.keys(updates).length === 0) {
        toast.error('Please select at least one field to update')
        return
      }

      // Show confirmation for bulk operations
      const confirmMessage = `Are you sure you want to update ${selectedCount} customer${selectedCount > 1 ? 's' : ''}?`
      if (!window.confirm(confirmMessage)) {
        setLoading(false)
        return
      }

      await onBulkUpdate({
        customerIds: selectedIds,
        updates
      })

      toast.success(`Successfully updated ${selectedCount} customers`)
      onClose()
      setFormData({ status: '', tags: [] })
    } catch (error) {
      console.error('Bulk update failed:', error)
      toast.error('Failed to update customers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Edit Customers</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected customer{selectedCount > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status (Optional)</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add tags to all selected customers..."
            />
            {formData.tags.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Will replace existing tags with: {formData.tags.join(', ')}
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium">Summary</p>
            <p className="text-xs text-muted-foreground mt-1">
              • Selected: {selectedCount} customer{selectedCount > 1 ? 's' : ''}
            </p>
            {formData.status && (
              <p className="text-xs text-muted-foreground">
                • Status will be set to: <span className="font-medium">{formData.status}</span>
              </p>
            )}
            {formData.tags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                • Tags will be replaced with: <span className="font-medium">{formData.tags.join(', ')}</span>
              </p>
            )}
            {!formData.status && formData.tags.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                • No changes selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!formData.status && formData.tags.length === 0)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedCount} Customer${selectedCount > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EnhancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  error?: string
  onDeleteContact?: (id: string) => void
  onEditContact?: (contact: any) => void
  onBulkUpdate?: (updates: { customerIds: string[], updates: any }) => Promise<void>
}

export function EnhancedDataTable<TData, TValue>({
  columns,
  data,
  loading,
  error,
  onDeleteContact,
  onEditContact,
  onBulkUpdate,
}: EnhancedDataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)

  const selectedIds = Object.keys(rowSelection)
  const selectedCount = selectedIds.length

  // Add checkbox column for row selection
  const enhancedColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ]

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCount} selected customer${selectedCount > 1 ? 's' : ''}?`)) {
      return
    }

    try {
      for (const id of selectedIds) {
        await onDeleteContact?.(id)
      }
      setRowSelection({})
      toast.success(`Successfully deleted ${selectedCount} customers`)
    } catch (error) {
      console.error('Bulk delete failed:', error)
      toast.error('Failed to delete some customers')
    }
  }

  const handleBulkUpdate = async (updates: { customerIds: string[], updates: any }) => {
    if (!onBulkUpdate) {
      throw new Error('Bulk update function not provided')
    }

    await onBulkUpdate(updates)
    setRowSelection({})
  }

  // Helper function to render status badges
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedCount} customer{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkEditDialog(true)}
              className="gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit {selectedCount > 1 ? 'All' : ''}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-1"
            >
              <Trash className="h-3 w-3" />
              Delete {selectedCount > 1 ? 'All' : ''}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={enhancedColumns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : error ? error : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        isOpen={showBulkEditDialog}
        onClose={() => setShowBulkEditDialog(false)}
        selectedIds={selectedIds}
        selectedCount={selectedCount}
        onBulkUpdate={handleBulkUpdate}
      />
    </div>
  )
}