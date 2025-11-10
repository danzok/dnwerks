# Customer Cards Block

Customer contact management cards with status indicators, contact information display, and action menus.

## Features

- **👤 Contact Display**: Name, phone, email, and location information
- **📊 Status Indicators**: Active, inactive, and pending status badges
- **📞 Contact Methods**: Visual indicators for available contact methods
- **⚙️ Action Menus**: Dropdown menus for edit, contact, and delete actions
- **📱 Responsive Design**: Adaptive grid layout (1-4 columns)
- **📅 Date Tracking**: Shows when customer was added with smart formatting
- **🎨 Modern Styling**: Consistent with standard card template

## Installation

```bash
npx shadcn-ui@latest add customer-cards-01
```

## Usage

```tsx
import { CustomerCards } from "@/components/blocks/customer-cards-01/customer-cards";

const customers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith", 
    email: "john.smith@email.com",
    phone: "5551234567",
    state: "CA",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z"
  }
];

export default function CustomersPage() {
  return (
    <CustomerCards 
      customers={customers}
      onEdit={(customer) => console.log("Edit:", customer)}
      onDelete={(id) => console.log("Delete:", id)}
      onContact={(customer) => console.log("Contact:", customer)}
    />
  );
}
```

## Props

### CustomerCards

| Prop | Type | Description |
|------|------|-------------|
| `customers` | `Customer[]` | Array of customer objects |
| `onEdit` | `(customer: Customer) => void` | Optional edit handler |
| `onDelete` | `(id: string) => void` | Optional delete handler |
| `onContact` | `(customer: Customer) => void` | Optional contact handler |
| `className` | `string` | Optional additional CSS classes |

### Customer Interface

```tsx
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
```

## Status Types

- **Active**: Customer is actively engaged
- **Inactive**: Customer is not currently active
- **Pending**: Customer status is pending verification

## Grid Layout

- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns
- **Large Desktop**: 4 columns

## Features

### Phone Number Formatting

Automatically formats US phone numbers:
```tsx
// Input: "5551234567"
// Output: "(555) 123-4567"
```

### Smart Date Formatting

Shows relative dates with smart formatting:
- **Today**: "Today"
- **Yesterday**: "Yesterday" 
- **Recent**: "5 days ago"
- **Older**: "2 months ago"

### Contact Method Detection

Automatically detects available contact methods:
- "Email & Phone"
- "Email Only"
- "Phone Only"
- "No Contact Info"

## Customization

### Status Colors

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
  }
};
```

### Phone Number Formatting

Customize the phone formatting function:

```tsx
const formatPhoneDisplay = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  // Add your custom formatting logic
  return phone;
};
```

## Examples

### Basic Usage
```tsx
<CustomerCards customers={customers} />
```

### With All Handlers
```tsx
<CustomerCards 
  customers={customers}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onContact={handleContact}
  className="gap-6"
/>
```

### Contact Actions
```tsx
const handleContact = (customer: Customer) => {
  if (customer.email) {
    window.location.href = `mailto:${customer.email}`;
  } else if (customer.phone) {
    window.location.href = `tel:${customer.phone}`;
  }
};
```

## Dependencies

- **lucide-react**: Icons and visual elements
- **@radix-ui**: UI primitives for dropdown menus