"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  HelpCircle,
  Plus,
  ChevronDown,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/auth/UserProfile";
import { useUser } from "@/lib/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Customers", href: "/contacts", icon: Users },
  { name: "Campaigns", href: "/campaigns", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Users },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { profile } = useUserProfile();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-sm">D</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                DNwerks
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1.5"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-100">
            <Button className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150
                    ${isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin Navigation - Only show to admin users */}
            {profile?.role === 'admin' && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Admin
                </p>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150
                        ${isActive
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center px-3 py-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              All systems operational
            </div>

            <div className="mt-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-900">Free Plan</p>
                  <p className="text-xs text-gray-500">2,000 SMS/month</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs p-1 h-6">
                  Upgrade
                </Button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-3 px-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 rounded-md px-3 py-1.5 bg-gray-100 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers, campaigns..."
                  className="bg-transparent text-sm border-none outline-none flex-1 text-gray-600 placeholder-gray-400"
                />
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded text-gray-400 bg-white border border-gray-200">
                  ⌘K
                </kbd>
              </div>

              {/* Help */}
              <Button variant="ghost" size="sm" className="p-2">
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-2 pl-2">
                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">U</span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}