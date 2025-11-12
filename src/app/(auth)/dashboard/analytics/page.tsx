"use client"

import { useState } from "react";
import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompactStats } from "@/components/ui/compact-stats"
import { ContactsByStateChart } from "@/components/contacts/contacts-by-state-chart"
import { useContactsRealtime } from "@/hooks/use-contacts-realtime"
import {
  BarChart3,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Download,
  MapPin,
  Clock,
  Target
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("30days");
  const [campaignFilter, setCampaignFilter] = useState("all");
  
  // Get real data from contacts hook
  const { contacts, stats, loading } = useContactsRealtime();
  
  // Calculate real analytics metrics
  const getAnalyticsData = () => {
    if (loading || !contacts) return null;
    
    // Calculate time-based metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentContacts = contacts.filter(c => c.createdAt > thirtyDaysAgo);
    const weeklyContacts = contacts.filter(c => c.createdAt > sevenDaysAgo);
    
    // State distribution
    const stateDistribution = contacts.reduce((acc, contact) => {
      const state = contact.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topStates = Object.entries(stateDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    // Growth metrics
    const growthRate = stats.total > 0 ? Math.round((recentContacts.length / stats.total) * 100) : 0;
    const weeklyGrowth = weeklyContacts.length;
    
    return {
      totalContacts: stats.total,
      activeContacts: stats.active,
      inactiveContacts: stats.inactive,
      recentlyAdded: stats.recentlyAdded,
      growthRate,
      weeklyGrowth,
      topStates,
      stateCount: Object.keys(stateDistribution).length
    };
  };
  
  const analytics = getAnalyticsData();

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">

            {/* Simple Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-1 text-sm">Real-time insights from your contact database</p>
            </div>

            {/* Real-time Analytics Stats */}
            {loading ? (
              <div className="mb-5">
                <CompactStats 
                  stats={[]} 
                  loading={true} 
                />
              </div>
            ) : analytics ? (
              <div className="mb-5">
                <CompactStats
                  stats={[
                    {
                      title: "Total Contacts",
                      value: analytics.totalContacts,
                      icon: "Users",
                      color: "text-blue-600",
                      bgColor: "bg-blue-100"
                    },
                    {
                      title: "Active Contacts",
                      value: analytics.activeContacts,
                      icon: "MessageSquare",
                      color: "text-green-600",
                      bgColor: "bg-green-100"
                    },
                    {
                      title: "Recent Growth",
                      value: `${analytics.growthRate}%`,
                      icon: "TrendingUp",
                      color: "text-purple-600",
                      bgColor: "bg-purple-100"
                    },
                    {
                      title: "States Covered",
                      value: analytics.stateCount,
                      icon: "Users", // Will need to map to MapPin-like icon
                      color: "text-orange-600",
                      bgColor: "bg-orange-100"
                    }
                  ]}
                />
              </div>
            ) : null}

            {/* Real Analytics Dashboard Layout has been added above with ContactsByStateChart and real metrics */}

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}