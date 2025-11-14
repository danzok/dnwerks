"use client"

import { ColumnDef } from "@tanstack/react-table"
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
  MapPin,
} from "lucide-react"

// This interface should match the Contact interface from useContactsRealtime hook
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  state: string
  status: "active" | "inactive"
  tags: string[]
  createdAt: Date
  company?: string
  address?: string
  notes?: string
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <Badge variant="default">Active</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const createEnhancedContactColumns = (
  onDeleteContact?: (id: string) => void,
  onEditContact?: (contact: Contact) => void
): ColumnDef<Contact>[] => {
  return [
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("firstName") || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("lastName") || "-"}
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
          <div className="flex items-center gap-2">
            {email && (
              <>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${email}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {email}
                </a>
              </>
            )}
            {!email && <span className="text-muted-foreground">-</span>}
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
          <div className="flex items-center gap-2">
            {phone && (
              <>
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${phone}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {phone}
                </a>
              </>
            )}
            {!phone && <span className="text-muted-foreground">-</span>}
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
          <div className="flex items-center gap-2">
            {company && (
              <>
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{company}</span>
              </>
            )}
            {!company && <span className="text-muted-foreground">-</span>}
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
          <div className="flex items-center gap-2">
            {state && (
              <>
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{state}</span>
              </>
            )}
            {!state && <span className="text-muted-foreground">-</span>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return getStatusBadge(status)
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[]
        if (!tags || tags.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const contact = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEditContact?.(contact)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteContact?.(contact.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}