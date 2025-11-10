"use client"

import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, Filter, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ActiveContactsPage() {
  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Simple Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon">
                  <Link href="/dashboard/customers">
                    <ArrowLeft />
                  </Link>
                </Button>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Active Contacts</h1>
                  <p className="text-gray-600 mt-2">View and manage your active contact database</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">11.6K</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">89.2%</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Filter className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">342</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Active</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">7 days</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Filter className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Contacts Overview */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Active Contacts Overview
                </CardTitle>
                <CardDescription>
                  Your active contact database with high engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    11,569 Active Contacts
                  </h3>
                  <p className="text-gray-600 mb-6">
                    These contacts have shown recent activity and engagement with your campaigns
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/dashboard/customers">
                      <Button variant="outline">
                        View All Contacts
                      </Button>
                    </Link>
                    <Link href="/dashboard/customers/import">
                      <Button>
                        Import More Contacts
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Contact Tips */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Active Contact Management</CardTitle>
                <CardDescription>
                  Tips for maintaining high contact engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Regular Communication</h4>
                    <p className="text-sm text-gray-600">Keep contacts engaged with regular, valuable content.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Personalization</h4>
                    <p className="text-sm text-gray-600">Use contact names and preferences for better engagement.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Monitor Activity</h4>
                    <p className="text-sm text-gray-600">Track engagement metrics to identify at-risk contacts.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Re-engagement</h4>
                    <p className="text-sm text-gray-600">Create campaigns to re-engage inactive contacts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}