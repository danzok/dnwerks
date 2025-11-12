# Contacts Tag Filter and Pagination Implementation Plan

## Overview
This document outlines the implementation plan to add tag filtering and pagination (limit to 10 contacts) to the contacts page.

## Database Changes

### 1. Add Tags Field to Customers Table
```sql
-- Add tags field as TEXT array to store multiple tags per contact
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for better performance on tag queries
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);
```

## API Changes

### 2. Update Customers API (`/api/customers/route.ts`)

#### GET Endpoint Changes:
- Add support for tag filtering in query parameters
- Add pagination parameters (limit, page)
- Return paginated results with metadata

#### POST Endpoint Changes:
- Accept tags array in request body
- Validate and store tags in the database

### 3. Update Customer API (`/api/customers/[id]/route.ts`)
- Add support for updating tags in PUT/PATCH requests

## Frontend Changes

### 4. Update useContactsRealtime Hook
- Add tag filtering logic
- Implement pagination with limit of 10 contacts per page
- Add pagination state management (currentPage, totalPages)
- Update the filtering logic to include tags

### 5. Update Contacts Page (`/app/contacts/page.tsx`)
- Add tag filter component (multi-select dropdown)
- Add pagination controls
- Update the form to include tags input
- Display tags in the contact table

### 6. Update VercelDataTable Component
- Add tags column to the table
- Display tags as badges
- Ensure responsive design with the new column

### 7. Create Tag Input Component
- Create a reusable tag input component
- Support adding/removing tags
- Auto-complete suggestions for existing tags

## Implementation Details

### Tag Storage Format
- Tags will be stored as PostgreSQL TEXT array: `['vip', 'customer', 'newsletter']`
- Frontend will handle them as JavaScript arrays: `['vip', 'customer', 'newsletter']`

### Pagination Implementation
- Default limit: 10 contacts per page
- Pagination controls: Previous, Next, and page numbers
- Show total contacts and current page info
- Maintain filter state across page changes

### Tag Filtering
- Multi-select dropdown with checkboxes
- Show all available tags from the contact list
- Support filtering by multiple tags (AND logic)
- Clear all tags option

### UI/UX Considerations
- Maintain existing design system and styling
- Ensure dark mode compatibility
- Responsive design for mobile devices
- Loading states for tag filtering and pagination

## File Structure Changes

```
src/
├── app/
│   ├── api/customers/
│   │   ├── route.ts (modify)
│   │   └── [id]/route.ts (modify)
│   └── contacts/
│       └── page.tsx (modify)
├── components/
│   ├── contacts/
│   │   ├── vercel-data-table.tsx (modify)
│   │   └── tag-input.tsx (new)
│   └── ui/
│       └── multi-select.tsx (new)
└── hooks/
    └── use-contacts-realtime.ts (modify)
```

## Testing Plan

1. Database migration testing
2. API endpoint testing with tags
3. Frontend component testing
4. Integration testing for filtering and pagination
5. Cross-browser compatibility testing
6. Mobile responsiveness testing

## Deployment Considerations

1. Database migration needs to be run in production
2. API changes need to be deployed before frontend changes
3. Backward compatibility for existing contacts without tags
4. Performance monitoring for tag queries

## Future Enhancements

1. Tag management page (create, edit, delete tags)
2. Tag analytics and reporting
3. Bulk tag operations
4. Tag-based auto-segmentation
5. Tag suggestions based on contact attributes

## Database Migration Script

```sql
-- ============================================
-- Add Tags Field to Customers Table
-- ============================================
-- Run this script in your Supabase SQL Editor

-- Add tags field as TEXT array to store multiple tags per contact
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for better performance on tag queries
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);

-- Update existing customers to have empty tags array (optional, as DEFAULT handles this)
UPDATE customers 
SET tags = '{}' 
WHERE tags IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'tags';
```

## Component Specifications

### TagInput Component Props
```typescript
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
}
```

### MultiSelect Component Props
```typescript
interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}
```

### Updated API Response Format
```typescript
interface PaginatedContactsResponse {
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  tags: string[]; // All available tags for filtering
}
```

### Updated useContactsRealtime Hook Interface
```typescript
interface UseContactsRealtimeResult {
  contacts: Contact[];
  filteredContacts: Contact[];
  stats: ContactStats;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshContacts: () => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  // New properties
  availableTags: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
}
```

## Implementation Sequence

1. **Database Migration** (First)
   - Run the SQL migration to add tags field
   - Verify the changes in Supabase

2. **Backend API Updates** (Second)
   - Update GET endpoint to support tag filtering and pagination
   - Update POST endpoint to handle tags
   - Update PUT/PATCH endpoint for customer updates

3. **Frontend Hook Updates** (Third)
   - Modify useContactsRealtime to handle new API response
   - Add pagination state management
   - Add tag filtering logic

4. **UI Components** (Fourth)
   - Create TagInput component
   - Create MultiSelect component
   - Update VercelDataTable to show tags

5. **Page Integration** (Fifth)
   - Update contacts page with tag filter
   - Add pagination controls
   - Update contact form with tags input

6. **Testing & Refinement** (Last)
   - Test all functionality
   - Fix any issues
   - Optimize performance

## Performance Considerations

1. **Database Indexing**
   - GIN index on tags array for fast containment queries
   - Consider partial indexes for common tag combinations

2. **Frontend Optimization**
   - Debounce search queries
   - Cache available tags
   - Virtual scrolling for large contact lists (future enhancement)

3. **API Optimization**
   - Implement server-side filtering to reduce data transfer
   - Consider edge caching for tag lists
   - Pagination to limit query results