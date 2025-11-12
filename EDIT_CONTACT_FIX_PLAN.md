# Edit Contact Functionality Fix Plan

## Problem Analysis

The edit contact functionality in the DNwerks SMS Dashboard is not working. After investigating the codebase, I've identified the following issues:

1. **Missing Edit Handler**: In `src/components/contacts/vercel-data-table.tsx`, the edit button only has a console.log statement and doesn't actually trigger the edit dialog.

2. **Incomplete Edit Implementation**: While the contacts page has an edit dialog form, there's no connection between the edit button in the table and the form.

3. **Missing Edit Function**: The `src/hooks/use-contacts-realtime.ts` hook doesn't include an edit/update function, only delete.

4. **Form Submission Issue**: The form in `src/app/contacts/page.tsx` only handles creating new contacts (POST to `/api/customers`) but doesn't handle updating existing contacts (PATCH to `/api/customers/[id]`).

## Solution Implementation Plan

### 1. Update the VercelDataTable Component (`src/components/contacts/vercel-data-table.tsx`)

- Add an `onEditContact` prop to the `DataTableProps` interface
- Update the `createContactColumns` function to accept an `onEditContact` parameter
- Modify the edit button's onClick handler to call the `onEditContact` function with the contact data

### 2. Update the useContactsRealtime Hook (`src/hooks/use-contacts-realtime.ts`)

- Add an `updateContact` function to the `UseContactsRealtimeResult` interface
- Implement the `updateContact` function that:
  - Makes a PATCH request to `/api/customers/[id]`
  - Updates the local state with the updated contact
  - Triggers storage events for cross-tab sync
- Export the `updateContact` function in the return object

### 3. Update the Contacts Page (`src/app/contacts/page.tsx`)

- Extract the `updateContact` function from the `useContactsRealtime` hook
- Create an `handleEditContact` function that:
  - Sets the `editingContact` state with the selected contact
  - Populates the form with the contact data
  - Opens the edit dialog
- Modify the `handleSubmit` function to handle both create and update operations:
  - Check if `editingContact` exists
  - If editing, make a PATCH request to `/api/customers/[id]`
  - If creating, make a POST request to `/api/customers`
- Pass the `handleEditContact` function to the `VercelDataTable` component
- Update the form submission button text based on whether editing or creating

### 4. Update the API Route (`src/app/api/customers/[id]/route.ts`)

- The PATCH route already exists and looks correct, but we should verify it handles all the fields properly
- Ensure it returns the updated contact data

## Implementation Steps

1. First, update the `VercelDataTable` component to accept and use an edit handler
2. Next, add the `updateContact` function to the `useContactsRealtime` hook
3. Then, update the contacts page to handle both create and edit operations
4. Finally, test the complete edit functionality

## Files to Modify

1. `src/components/contacts/vercel-data-table.tsx`
2. `src/hooks/use-contacts-realtime.ts`
3. `src/app/contacts/page.tsx`

## Testing Plan

1. Test clicking the edit button on a contact
2. Verify the form populates with the correct contact data
3. Test modifying the contact data and saving
4. Verify the contact is updated in the table
5. Test error handling for invalid data
6. Test cross-tab synchronization

## Expected Outcome

After implementing these changes, users will be able to:
1. Click the edit button on any contact in the table
2. See a pre-populated form with the contact's current information
3. Modify any of the contact fields
4. Save the changes and see the updated contact in the table
5. Receive appropriate success/error messages