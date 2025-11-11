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
        {
          title: "Reports",
          url: "/dashboard/analytics",
          icon: BarChart3,
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
      items: [
        {
          title: "Admin Panel",
          url: "/admin",
          icon: Shield,
        },
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
      items: [
        {
          title: "Docs",
          url: "/docs",
          icon: FileText,
        },
      ],
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  );
}