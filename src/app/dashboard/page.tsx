"use client";

import { Suspense, useEffect, useState } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompactStats } from "@/components/ui/compact-stats"
import { MessageSquare, Users, Calendar, Settings, Plus, Send, Archive, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalCampaigns: number;
  messagesSent: number;
  activeContacts: number;
  deliveryRate: number;
  recentCampaigns: any[];
  scheduledCampaigns: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    messagesSent: 0,
    activeContacts: 0,
    deliveryRate: 0,
    recentCampaigns: [],
    scheduledCampaigns: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch campaigns data
      const campaignsResponse = await fetch('/api/campaigns');
      const campaignsData = await campaignsResponse.json();
      
      // Fetch customers data
      const customersResponse = await fetch('/api/customers');
      const customersData = await customersResponse.json();

      // Calculate stats from real data
      const totalCampaigns = campaignsData.data?.length || 0;
      const activeContacts = customersData?.length || 0;
      
      // Calculate messages sent (sum of all campaign recipients)
      const messagesSent = campaignsData.data?.reduce((total: number, campaign: any) =>
        total + (campaign.total_recipients || 0), 0) || 0;

      // Calculate delivery rate (mock for now, would come from actual delivery data)
      const deliveryRate = messagesSent > 0 ? 98.5 : 0;

      // Filter recent and scheduled campaigns
      const recentCampaigns = campaignsData.data?.slice(0, 3) || [];
      const scheduledCampaigns = campaignsData.data?.filter((c: any) => c.status === 'scheduled').slice(0, 3) || [];

      setStats({
        totalCampaigns,
        messagesSent,
        activeContacts,
        deliveryRate,
        recentCampaigns,
        scheduledCampaigns
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };
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
                    value: stats.totalCampaigns.toString(),
                    icon: "MessageSquare",
                    color: "text-blue-600",
                    bgColor: "bg-blue-100"
                  },
                  {
                    title: "Messages Sent",
                    value: formatNumber(stats.messagesSent),
                    icon: "Send",
                    color: "text-green-600",
                    bgColor: "bg-green-100"
                  },
                  {
                    title: "Active Contacts",
                    value: formatNumber(stats.activeContacts),
                    icon: "Users",
                    color: "text-purple-600",
                    bgColor: "bg-purple-100"
                  },
                  {
                    title: "Delivery Rate",
                    value: `${stats.deliveryRate}%`,
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
                    <Button size="sm" className="h-7 px-3 text-xs" onClick={() => window.location.href = '/campaigns/create'}>
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
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => window.location.href = '/campaigns/create'}>
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
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => window.location.href = '/contacts'}>
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
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading campaigns...</div>
                    ) : stats.recentCampaigns.length > 0 ? (
                      stats.recentCampaigns.map((campaign: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(campaign.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              campaign.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                              campaign.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                              campaign.status === 'active' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1) || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">{campaign.total_recipients || 0} recipients</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No campaigns found</div>
                    )}
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
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading scheduled campaigns...</div>
                    ) : stats.scheduledCampaigns.length > 0 ? (
                      stats.scheduledCampaigns.map((campaign: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Scheduled'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Scheduled</p>
                            <p className="text-xs text-muted-foreground">{campaign.total_recipients || 0} recipients</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No scheduled campaigns</div>
                    )}
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
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.totalCampaigns}</p>
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
                      <p className="text-2xl font-bold text-foreground mt-1">{formatNumber(stats.messagesSent)}</p>
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
                      <p className="text-2xl font-bold text-foreground mt-1">{formatNumber(stats.activeContacts)}</p>
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
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.deliveryRate}%</p>
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
                  <Button variant="outline" className="justify-start h-8 text-sm" onClick={() => window.location.href = '/campaigns/archived'}>
                    <Archive className="h-3 w-3 mr-2" />
                    View Archive
                  </Button>
                  <Button variant="outline" className="justify-start h-8 text-sm" onClick={() => window.location.href = '/dashboard/customers/import'}>
                    <Users className="h-3 w-3 mr-2" />
                    Import Contacts
                  </Button>
                  <Button variant="outline" className="justify-start h-8 text-sm" onClick={() => window.location.href = '/settings'}>
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