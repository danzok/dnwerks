"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, Users, MessageSquare, DollarSign, Activity } from "lucide-react";
import { CampaignMetricsChart } from "./campaign-metrics-chart";
import { DeliveryMetricsChart } from "./delivery-metrics-chart";
import { CustomerEngagementChart } from "./customer-engagement-chart";
import { CostAnalysisChart } from "./cost-analysis-chart";
import { AnalyticsTable } from "./analytics-table";
import { useAnalytics } from "../hooks/use-analytics";

interface TimeRange {
  value: string;
  label: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>(timeRanges[1]); // Default to 30 days
  const [isLoading, setIsLoading] = useState(true);

  const {
    metrics,
    campaignData,
    deliveryData,
    engagementData,
    costData,
    refreshAnalytics,
  } = useAnalytics(timeRange.days);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await refreshAnalytics();
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeRange, refreshAnalytics]);

  const handleExport = async () => {
    try {
      const data = {
        metrics,
        campaigns: campaignData,
        delivery: deliveryData,
        engagement: engagementData,
        costs: costData,
        timeRange: timeRange.label,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${timeRange.value}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export analytics:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-2 border-b border-border/60">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Monitor your SMS campaign performance and customer engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={timeRange.value}
            onValueChange={(value) => {
              const selected = timeRanges.find((tr) => tr.value === value);
              if (selected) setTimeRange(selected);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs *:data-[slot=card]:h-[200px] sm:grid-cols-2 lg:grid-cols-4">
        <Card className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <CardDescription>Total Messages</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.totalMessages.toLocaleString()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <TrendingUp className="w-3 h-3" />
                +{metrics.messageGrowth}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              SMS messages sent successfully
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <CardDescription>Delivery Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.deliveryRate.toFixed(1)}%
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <TrendingUp className="w-3 h-3" />
                +{metrics.deliveryRate > 95 ? '2.5' : '0.8'}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Excellent delivery performance <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {metrics.deliveredMessages.toLocaleString()} messages delivered
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <CardDescription>Customer Engagement</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metrics.engagementRate.toFixed(1)}%
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {metrics.engagementRate > 15 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    +{(metrics.engagementRate - 12).toFixed(1)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    -{(15 - metrics.engagementRate).toFixed(1)}%
                  </>
                )}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metrics.engagementRate > 15 ? 'Strong customer response' : 'Room for improvement'} 
              {metrics.engagementRate > 15 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
            <div className="text-muted-foreground">
              {metrics.engagedCustomers.toLocaleString()} customer responses
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <CardDescription>Campaign Costs</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${metrics.totalCost.toFixed(2)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingDown className="w-3 h-3" />
                -5.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Cost optimization working <TrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              ${(metrics.totalCost / metrics.totalMessages).toFixed(3)} per message
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">Detailed Analytics</h2>
          <p className="text-muted-foreground">
            Dive deeper into your campaign metrics with comprehensive charts and tables
          </p>
        </div>
        
        <Tabs defaultValue="campaigns" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-12 p-1">
            <TabsTrigger value="campaigns" className="font-medium">Campaigns</TabsTrigger>
            <TabsTrigger value="delivery" className="font-medium">Delivery</TabsTrigger>
            <TabsTrigger value="engagement" className="font-medium">Engagement</TabsTrigger>
            <TabsTrigger value="costs" className="font-medium">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CampaignMetricsChart data={campaignData} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-slate-600" />
                    </div>
                    Campaign Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AnalyticsTable
                    data={campaignData}
                    type="campaigns"
                    timeRange={timeRange.label}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    Delivery Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DeliveryMetricsChart data={deliveryData} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-slate-600" />
                    </div>
                    Delivery Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AnalyticsTable
                    data={deliveryData}
                    type="delivery"
                    timeRange={timeRange.label}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-lg">
                      <Users className="w-5 h-5 text-violet-600" />
                    </div>
                    Customer Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CustomerEngagementChart data={engagementData} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    Engagement Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AnalyticsTable
                    data={engagementData}
                    type="engagement"
                    timeRange={timeRange.label}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CostAnalysisChart data={costData} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-slate-600" />
                    </div>
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AnalyticsTable
                    data={costData}
                    type="costs"
                    timeRange={timeRange.label}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}