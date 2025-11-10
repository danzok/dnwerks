# Campaign Cards Block

Interactive campaign management cards with status tracking, progress indicators, and action menus.

## Features

- **📊 Status Tracking**: Visual status badges with icons (draft, scheduled, sending, completed, failed)
- **📈 Progress Visualization**: Delivery rate progress bars
- **⚙️ Action Menus**: Dropdown menus for edit, test, send, and delete actions
- **📱 Responsive Design**: Adaptive grid layout for different screen sizes
- **🎨 Modern Styling**: Gradient backgrounds and consistent card heights
- **📝 Message Preview**: Truncated message content with character limits

## Installation

```bash
npx shadcn-ui@latest add campaign-cards-01
```

## Usage

```tsx
import { CampaignCards } from "@/components/blocks/campaign-cards-01/campaign-cards";

const campaigns = [
  {
    id: "1",
    name: "Welcome Series",
    status: "completed",
    messageBody: "Welcome to our service! We're excited to have you on board.",
    totalRecipients: 1250,
    sentCount: 1250,
    deliveredCount: 1198,
    createdAt: "2024-01-15T10:30:00Z"
  }
];

export default function CampaignsPage() {
  return (
    <CampaignCards 
      campaigns={campaigns}
      onEdit={(campaign) => console.log("Edit:", campaign)}
      onDelete={(id) => console.log("Delete:", id)}
      onTest={(id) => console.log("Test:", id)}
      onSend={(id) => console.log("Send:", id)}
    />
  );
}
```

## Props

### CampaignCards

| Prop | Type | Description |
|------|------|-------------|
| `campaigns` | `Campaign[]` | Array of campaign objects |
| `onEdit` | `(campaign: Campaign) => void` | Optional edit handler |
| `onDelete` | `(id: string) => void` | Optional delete handler |
| `onTest` | `(id: string) => void` | Optional test send handler |
| `onSend` | `(id: string) => void` | Optional send handler |
| `className` | `string` | Optional additional CSS classes |

### Campaign Interface

```tsx
interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  messageBody: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  scheduledAt?: string;
  createdAt: string;
}
```

## Status Types

- **Draft**: Campaign is being prepared
- **Scheduled**: Campaign is scheduled for future sending
- **Sending**: Campaign is currently being sent
- **Completed**: Campaign has been sent successfully
- **Failed**: Campaign failed to send

## Grid Layout

- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

## Customization

### Status Colors

Modify status badge colors by updating the `getStatusColor` function:

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-800";
    case "completed":
      return "bg-green-100 text-green-800";
    // Add more cases...
  }
};
```

### Message Truncation

Adjust message preview length by modifying the `formatMessage` function:

```tsx
const formatMessage = (message: string) => {
  const maxLength = 80; // Adjust this value
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
};
```

## Examples

### Basic Usage
```tsx
<CampaignCards campaigns={campaigns} />
```

### With All Handlers
```tsx
<CampaignCards 
  campaigns={campaigns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onTest={handleTest}
  onSend={handleSend}
  className="my-4"
/>
```

## Dependencies

- **lucide-react**: Icons
- **@radix-ui**: UI primitives