import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  Edit,
  User,
  Calendar
} from "lucide-react";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  state?: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastContact?: string;
}

interface CustomerCardsProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onContact?: (customer: Customer) => void;
  className?: string;
}

export function CustomerCards({ 
  customers, 
  onEdit, 
  onDelete, 
  onContact,
  className = "" 
}: CustomerCardsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-campaign-success text-campaign-success-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-campaign-pending text-campaign-pending-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    // Simple US phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getFullName = (customer: Customer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.firstName || customer.lastName || "Unnamed Customer";
  };

  const getContactMethod = (customer: Customer) => {
    if (customer.email && customer.phone) {
      return "Email & Phone";
    } else if (customer.email) {
      return "Email Only";
    } else if (customer.phone) {
      return "Phone Only";
    }
    return "No Contact Info";
  };

  const getDaysSinceAdded = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {customers.map((customer) => (
        <Card key={customer.id} className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <CardDescription className="line-clamp-1">{getFullName(customer)}</CardDescription>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(customer)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onContact?.(customer)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(customer.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <CardTitle className="text-lg font-semibold @[250px]/card:text-xl line-clamp-1">
              {formatPhoneDisplay(customer.phone)}
            </CardTitle>
            
            <CardAction>
              <Badge variant="outline" className={`${getStatusColor(customer.status)} border-0`}>
                <User className="w-3 h-3" />
                <span className="ml-1 capitalize">{customer.status}</span>
              </Badge>
            </CardAction>
          </CardHeader>
          
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            {customer.email && (
              <div className="line-clamp-1 flex gap-2 font-medium w-full">
                <Mail className="size-4 flex-shrink-0" />
                <span className="text-xs truncate">{customer.email}</span>
              </div>
            )}
            {customer.state && (
              <div className="line-clamp-1 flex gap-2 text-muted-foreground w-full">
                <MapPin className="size-4 flex-shrink-0" />
                <span className="text-xs">{customer.state}, US</span>
              </div>
            )}
            <div className="text-muted-foreground w-full flex justify-between items-center mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span className="text-xs">Added {getDaysSinceAdded(customer.createdAt)}</span>
              </span>
              <span className="text-xs">{getContactMethod(customer)}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Example usage component
export function ExampleCustomerCards() {
  const sampleCustomers: Customer[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "5551234567",
      state: "CA",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      lastContact: "2024-01-20T14:15:00Z"
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson", 
      email: "sarah.j@email.com",
      phone: "5559876543",
      state: "NY",
      status: "active",
      createdAt: "2024-01-10T09:20:00Z"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Davis",
      phone: "5556781234",
      state: "TX", 
      status: "pending",
      createdAt: "2024-01-22T16:45:00Z"
    },
    {
      id: "4",
      firstName: "Lisa",
      lastName: "Wilson",
      email: "lisa.wilson@email.com",
      phone: "5554567890",
      state: "FL",
      status: "inactive",
      createdAt: "2023-12-05T11:30:00Z",
      lastContact: "2023-12-20T10:15:00Z"
    }
  ];

  const handleEdit = (customer: Customer) => {
    console.log("Edit customer:", customer.firstName, customer.lastName);
  };

  const handleDelete = (id: string) => {
    console.log("Delete customer:", id);
  };

  const handleContact = (customer: Customer) => {
    console.log("Contact customer:", customer.firstName, customer.lastName);
  };

  return (
    <CustomerCards 
      customers={sampleCustomers}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onContact={handleContact}
    />
  );
}