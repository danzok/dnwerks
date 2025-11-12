"use client"

import * as React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Shield,
  Zap,
  HelpCircle,
  BarChart3,
  Phone,
  Calendar,
  FileText,
  Database,
} from "lucide-react";
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserProfile } from '@/hooks/use-user-profile'
import { filterNavItemsByRole, type NavItem } from '@/lib/role-based-navigation'
import { UserRole } from '@/lib/types'

// DNwerks SMS Campaign Management Navigation - Simplified & Organized
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: MessageSquare,
      items: [
        {
          title: "Create Campaign",
          url: "/campaigns/create",
        },
        {
          title: "Archived Campaign",
          url: "/campaigns/archived",
        },
      ],
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: Phone,
      items: [
        {
          title: "All Contacts",
          url: "/contacts",
        },
        {
          title: "Import Contacts",
          url: "/dashboard/customers/import",
        },
      ],
    },
    {
      title: "Automation",
      url: "/automation",
      icon: Zap,
      items: [
        {
          title: "Workflows",
          url: "/automation/workflows",
        },
        {
          title: "Autoresponders",
          url: "/automation/autoresponders",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Phone Numbers",
          url: "/settings/phone-numbers",
        },
        {
          title: "API Keys",
          url: "/settings/api-keys",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
      requiresRole: 'admin' as UserRole,
    },
  ],
  navSecondary: [
    {
      title: "Documentation",
      url: "/docs",
      icon: FileText,
    },
    {
      title: "API Reference",
      url: "/api",
      icon: Database,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useUserProfile()
  const userRole = profile?.role || 'user'
  
  // Filter navigation items based on user role
  const filteredNavMain = filterNavItemsByRole(data.navMain, userRole)
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" className="data-[sidebar-menu-button]:!p-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-xl font-bold">D</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">DNwerks</span>
              <span className="truncate text-xs">SMS Dashboard</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  );
}