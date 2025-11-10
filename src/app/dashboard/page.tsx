import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompactStats } from "@/components/ui/compact-stats"
import { MessageSquare, Users, Calendar, Settings, Plus, Send, Archive, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* Simple Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm">Manage your SMS campaigns and communications</p>
            </div>

            {/* Quick Stats */}
            <div className="mb-5">
              <CompactStats
                stats={[
                  {
                    title: "Total Campaigns",
                    value: "24",
                    icon: "MessageSquare",
                    color: "text-blue-600",
                    bgColor: "bg-blue-100"
                  },
                  {
                    title: "Messages Sent", 
                    value: "45.2K",
                    icon: "Send",
                    color: "text-green-600",
                    bgColor: "bg-green-100"
                  },
                  {
                    title: "Active Contacts",
                    value: "12.8K", 
                    icon: "Users",
                    color: "text-purple-600",
                    bgColor: "bg-purple-100"
                  },
                  {
                    title: "Delivery Rate",
                    value: "98.5%",
                    icon: "TrendingUp",
                    color: "text-orange-600", 
                    bgColor: "bg-orange-100"
                  }
                ]}
              />
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Button size="sm" className="h-7 px-3 text-xs">
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">New Campaign</CardTitle>
                  <CardDescription className="text-xs">
                    Create and send a new SMS campaign
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                      Send
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Quick Send</CardTitle>
                  <CardDescription className="text-xs">
                    Send immediate message
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Contacts</CardTitle>
                  <CardDescription className="text-xs">
                    Manage contact lists
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              <Card className="border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Recent Campaigns
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your latest SMS campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Welcome Message</p>
                        <p className="text-sm text-muted-foreground">Sent 2 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Delivered</p>
                        <p className="text-xs text-muted-foreground">245 recipients</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Product Update</p>
                        <p className="text-sm text-muted-foreground">Sent yesterday</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Scheduled</p>
                        <p className="text-xs text-muted-foreground">1,200 recipients</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Newsletter</p>
                        <p className="text-sm text-muted-foreground">Sent 3 days ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                        <p className="text-xs text-muted-foreground">3,450 recipients</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Scheduled Messages
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Messages scheduled to be sent
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Holiday Promotion</p>
                        <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending</p>
                        <p className="text-xs text-muted-foreground">850 recipients</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Weekly Reminder</p>
                        <p className="text-sm text-muted-foreground">Friday, 2:00 PM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending</p>
                        <p className="text-xs text-muted-foreground">520 recipients</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Product Launch</p>
                        <p className="text-sm text-muted-foreground">Next Monday</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending</p>
                        <p className="text-xs text-muted-foreground">2,100 recipients</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                      <p className="text-2xl font-bold text-foreground mt-1">24</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                      <p className="text-2xl font-bold text-foreground mt-1">45.2K</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                      <p className="text-2xl font-bold text-foreground mt-1">12.8K</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                      <p className="text-2xl font-bold text-foreground mt-1">98.5%</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start h-8 text-sm">
                    <Archive className="h-3 w-3 mr-2" />
                    View Archive
                  </Button>
                  <Button variant="outline" className="justify-start h-8 text-sm">
                    <Users className="h-3 w-3 mr-2" />
                    Import Contacts
                  </Button>
                  <Button variant="outline" className="justify-start h-8 text-sm">
                    <Settings className="h-3 w-3 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}