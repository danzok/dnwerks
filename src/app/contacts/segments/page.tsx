"use client"

import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Database, Plus, Filter, Target, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ContactsSegmentsPage() {
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
                  <Link href="/contacts">
                    <ArrowLeft />
                  </Link>
                </Button>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Contact Segments</h1>
                  <p className="text-gray-600 mt-2">Create and manage contact segments for targeted campaigns</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Segments</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Segments</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Segmented Contacts</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">9.2K</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unsegmented</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">3.6K</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Filter className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create New Segment */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-600" />
                  Create New Segment
                </CardTitle>
                <CardDescription>
                  Build targeted contact segments for your campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Create Your First Segment
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Group contacts based on demographics, behavior, or custom criteria
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Segment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Segments */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  Existing Segments
                </CardTitle>
                <CardDescription>
                  Your current contact segments and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">VIP Customers</p>
                        <p className="text-sm text-gray-600">2,450 contacts • High value segment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Newsletter Subscribers</p>
                        <p className="text-sm text-gray-600">3,200 contacts • Email engaged</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Recent Purchases</p>
                        <p className="text-sm text-gray-600">1,800 contacts • Last 30 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Inactive 90+ Days</p>
                        <p className="text-sm text-gray-600">750 contacts • Re-engagement needed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segment Management Tips */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Segment Management Tips</CardTitle>
                <CardDescription>
                  Best practices for creating effective contact segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Define Clear Criteria</h4>
                    <p className="text-sm text-gray-600">Use specific, measurable criteria to create meaningful segments.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Regular Updates</h4>
                    <p className="text-sm text-gray-600">Keep segments updated with current contact data and behavior.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Test Performance</h4>
                    <p className="text-sm text-gray-600">Monitor segment performance to ensure they drive results.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Avoid Over-Segmentation</h4>
                    <p className="text-sm text-gray-600">Keep segments manageable and focused on key audience groups.</p>
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