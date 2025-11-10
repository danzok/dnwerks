# Campaign Components - Reusable Message Templates

## Overview

This directory contains improved components for creating and managing SMS campaign message templates with enhanced styling, better user experience, and comprehensive functionality.

## Key Components

### 🎨 ReusableTemplateModal
**File**: `reusable-template-modal.tsx`

A completely redesigned modal component for creating and editing message templates with:

- **Improved Layout**: Larger, well-organized modal with proper spacing
- **Live Preview**: Real-time phone mockup showing message appearance
- **Smart Validation**: Character limits, required fields, and helpful error messages
- **Placeholder System**: One-click insertion of dynamic placeholders
- **Category Management**: Visual category selection with icons and descriptions
- **Enhanced UX**: Better typography, consistent styling, and accessibility

### 📋 ImprovedTemplateManager  
**File**: `improved-template-manager.tsx`

A comprehensive template management interface featuring:

- **Advanced Search**: Filter by name, content, and category
- **Grid Layout**: Clean card-based template display
- **Bulk Actions**: Edit, duplicate, delete, and preview templates
- **Real-time Stats**: Character counts, update dates, and usage info
- **Responsive Design**: Works well on all screen sizes

## Key Improvements

### ✅ Fixed Styling Issues

**Before:**
- Small, cramped modal dialog
- Poor visual hierarchy
- Inconsistent spacing and typography
- Limited preview functionality

**After:**
- Spacious 4xl modal with proper sections
- Clear visual hierarchy with cards and separators
- Consistent spacing using Tailwind utility classes
- Real-time phone mockup preview

### 🎯 Enhanced User Experience

**New Features:**
- Live message preview with placeholder replacement
- One-click placeholder insertion with tooltips
- Smart character counting with SMS part calculation
- Category selection with visual feedback
- Comprehensive form validation
- Keyboard navigation support

### 🔧 Technical Improvements

- **TypeScript**: Full type safety with proper interfaces
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Efficient re-renders and optimized state management
- **Modularity**: Reusable components with flexible props interface

## Usage Examples

### Basic Template Creation

```tsx
import { ReusableTemplateModal } from "@/components/campaigns/reusable-template-modal";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  const handleSave = async (template) => {
    await createTemplate(template);
    setShowModal(false);
  };

  return (
    <ReusableTemplateModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSave={handleSave}
    />
  );
}
```

### Template Management

```tsx
import { ImprovedTemplateManager } from "@/components/campaigns/improved-template-manager";

function TemplatesPage() {
  return (
    <ImprovedTemplateManager 
      onTemplateSelect={(template) => {
        console.log("Selected:", template);
      }}
    />
  );
}
```

### Editing Existing Templates

```tsx
<ReusableTemplateModal
  isOpen={editMode}
  onClose={() => setEditMode(false)}
  onSave={handleUpdate}
  template={existingTemplate}  // Pre-fills the form
  title="Edit Template"
/>
```

## Props Interface

### ReusableTemplateModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ | Controls modal visibility |
| `onClose` | () => void | ✅ | Callback when modal closes |
| `onSave` | (template: Partial<CampaignTemplate>) => Promise<void> | ✅ | Save handler |
| `template` | CampaignTemplate | ❌ | Existing template for editing |
| `title` | string | ❌ | Custom modal title |
| `description` | string | ❌ | Custom modal description |

### ImprovedTemplateManager

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onTemplateSelect` | (template: CampaignTemplate) => void | ❌ | Template selection callback |
| `showCreateModal` | boolean | ❌ | External modal state control |
| `onOpenCreateModal` | () => void | ❌ | Custom create button handler |

## Features in Detail

### 📱 Live Preview
- Phone-style message bubbles
- Real-time placeholder replacement
- Character count and SMS part estimation
- Visual feedback for message length

### 🎨 Category System
- 5 predefined categories with unique colors and icons
- Visual category selection with descriptions
- Consistent color coding throughout the interface

### 🔍 Smart Search & Filtering
- Search by template name or content
- Category filtering with visual indicators
- Real-time results with result counts

### ✏️ Placeholder System
- Pre-defined customer placeholders
- One-click insertion at cursor position
- Tooltip descriptions for each placeholder
- Preview shows realistic sample data

### 🛡️ Validation & Error Handling
- Required field validation
- Character limit warnings
- Minimum content length enforcement
- Clear, helpful error messages

## Demo

See the complete showcase at: `/showcase/templates`

The showcase includes:
- Interactive demos of both components
- Feature comparison (before vs after)
- Integration examples and code samples
- Live examples you can interact with

## Next Steps

1. **Integration**: Replace existing template modals with the new components
2. **Testing**: Add comprehensive unit and integration tests
3. **Documentation**: Expand documentation with more usage examples
4. **Feedback**: Gather user feedback and iterate on the design
5. **Performance**: Monitor performance and optimize as needed

## File Structure

```
src/components/campaigns/
├── reusable-template-modal.tsx       # Main modal component
├── improved-template-manager.tsx     # Template management interface
├── README.md                         # This documentation
└── [existing files...]               # Original components for reference
```