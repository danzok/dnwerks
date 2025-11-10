"use client"

import * as React from "react"
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
} from "lucide-react"

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
} from "@/components/ui/sidebar"

// DNwerks SMS Campaign Management Navigation - Simplified & Organized
const data = {
  user: {
    name: "Admin User",
    email: "admin@dnwerks.com",
    avatar: "/avatars/admin.jpg",
  },
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
          title: "All Campaigns",
          url: "/campaigns",
        },
        {
          title: "Create Campaign",
          url: "/campaigns/create",
        },
        {
          title: "Templates",
          url: "/campaigns/templates",
        },
        {
          title: "Scheduled",
          url: "/campaigns?filter=scheduled",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Contact Database",
      url: "/contacts",
      icon: Database,
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
      items: [
        {
          title: "Admin Panel",
          url: "/admin",
        },
        {
          title: "User Management",
          url: "/admin/users",
        },
        {
          title: "System Settings",
          url: "/admin/settings",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Docs",
      url: "/docs",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="/dashboard">
                <MessageSquare className="h-5 w-5" />
                <span className="text-base font-semibold">DNwerks</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}