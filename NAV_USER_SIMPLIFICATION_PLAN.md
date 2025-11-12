# NavUser Component Simplification Plan

## Current Implementation Analysis
The current `NavUser` component (`src/components/nav-user.tsx`) displays:
- User avatar, name, and email in a dropdown menu trigger
- Dropdown menu with multiple options: Account, Billing, Notifications, and Logout
- Uses DropdownMenu component from shadcn/ui

## Required Changes
Simplify the component to only show:
1. User info section (non-clickable)
2. Logout button below the user info

## New Implementation Design

### Component Structure
```tsx
export function NavUser({
  user,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  // User info display (non-clickable)
  // Logout button (separate, below user info)
}
```

### Visual Layout
```
┌─────────────────────┐
│ [Avatar] User Name   │
│         user@email   │
├─────────────────────┤
│ [🚪] Logout         │
└─────────────────────┘
```

### Key Changes
1. Remove DropdownMenu component and all related imports
2. Keep Avatar component for user display
3. Add Button component for logout
4. Simplify the layout to use SidebarMenu and SidebarMenuItem
5. Maintain the same logout functionality

### Required Imports
```tsx
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
```

### Implementation Steps
1. Replace the entire content of `src/components/nav-user.tsx`
2. Create a simple user info display section
3. Add a separate logout button below
4. Keep the existing logout logic

## Code Implementation

### Complete New Component Code
```tsx
"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

export function NavUser({
  user,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const router = useRouter()
  const supabase = createClient()
  
  // Default user data if none provided
  const userDefaults = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || ""
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect to login even if there's an error
      router.push('/login')
    }
  }

  return (
    <SidebarMenu className="gap-2">
      {/* User Info Section */}
      <SidebarMenuItem>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userDefaults.avatar} alt={userDefaults.name} />
            <AvatarFallback className="rounded-lg">
              {userDefaults.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userDefaults.name}</p>
            <p className="text-xs text-muted-foreground truncate">{userDefaults.email}</p>
          </div>
        </div>
      </SidebarMenuItem>
      
      {/* Logout Button */}
      <SidebarMenuItem>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

## Benefits of This Implementation
1. **Simplified UI**: Only shows essential information (user info and logout)
2. **Clear Separation**: User info and logout are visually distinct
3. **Consistent Styling**: Uses existing sidebar styling patterns
4. **Maintained Functionality**: Logout behavior remains the same
5. **Responsive**: Works well in both mobile and desktop views

## Testing Checklist
- [ ] User info displays correctly (name, email, avatar)
- [ ] Logout button functions properly
- [ ] Component renders correctly in sidebar footer
- [ ] Responsive design works on mobile
- [ ] Styling matches sidebar theme