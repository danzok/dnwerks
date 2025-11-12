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
import { useUserProfile } from '@/hooks/use-user-profile'

export function NavUser() {
  const router = useRouter()
  const supabase = createClient()
  const { profile, loading } = useUserProfile()
  
  // Get user data from profile or fallback to defaults
  const userData = {
    name: profile?.full_name || profile?.email?.split('@')[0] || "User",
    email: profile?.email || "user@example.com",
    avatar: "" // No avatar field in UserProfile, using fallback
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

  if (loading) {
    return (
      <SidebarMenu className="gap-2">
        <SidebarMenuItem>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu className="gap-2">
      {/* User Info Section */}
      <SidebarMenuItem>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="rounded-lg">
              {userData.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userData.name}</p>
            <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
          </div>
        </div>
      </SidebarMenuItem>
      
      {/* Logout Button */}
      <SidebarMenuItem>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
