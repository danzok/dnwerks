import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompactStats } from "@/components/ui/compact-stats"
import { RecentCampaigns } from "@/components/campaigns/recent-campaigns";
import { CampaignSkeleton } from "@/components/campaigns/campaign-skeleton";
import { Plus, MessageSquare, Send, Users, Calendar, TrendingUp } from "lucide-react";

export default function CampaignsPage() {
  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">

            {/* Simple Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
              <p className="text-muted-foreground mt-1 text-sm">Create and manage your SMS campaigns</p>
            </div>

            {/* Quick Stats */}
            <div className="mb-5">
              <CompactStats
                stats={[
                  {
                    title: "Total Campaigns",
                    value: "24",
                    icon: "MessageSquare",
                    color: "text-blue-600 dark:text-blue-400",
                    bgColor: "bg-blue-100 dark:bg-blue-900/20"
                  },
                  {
                    title: "Messages Sent", 
                    value: "45.2K",
                    icon: "Send",
                    color: "text-green-600 dark:text-green-400",
                    bgColor: "bg-green-100 dark:bg-green-900/20"
                  },
                  {
                    title: "Active Recipients",
                    value: "12.8K", 
                    icon: "Users",
                    color: "text-purple-600 dark:text-purple-400",
                    bgColor: "bg-purple-100 dark:bg-purple-900/20"
                  },
                  {
                    title: "Delivery Rate",
                    value: "98.5%",
                    icon: "TrendingUp",
                    color: "text-orange-600 dark:text-orange-400",
                    bgColor: "bg-orange-100 dark:bg-orange-900/20"
                  }
                ]}
              />
            </div>

            {/* Quick Actions */}
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
                    Create a new SMS campaign
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                      Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Scheduled</CardTitle>
                  <CardDescription className="text-xs">
                    View scheduled campaigns
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                      Reports
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Performance</CardTitle>
                  <CardDescription className="text-xs">
                    View campaign reports
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns Section */}
            <Suspense fallback={<CampaignSkeleton />}>
              <RecentCampaigns />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}