"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, MessageSquare, DollarSign, Activity, Play, Pause, RotateCcw } from "lucide-react";

// Import our custom components for demonstration
import { MetricCards } from "@/blocks/metric-cards-01/components/metric-cards";
import { CampaignCards } from "@/blocks/campaign-cards-01/components/campaign-cards";
import { CustomerCards } from "@/blocks/customer-cards-01/components/customer-cards";

export function ComponentsShowcase() {
  const [isAnimated, setIsAnimated] = useState(true);

  // Sample data for demonstrations
  const sampleMetrics = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "Monthly revenue",
      trend: { value: 12.5, isPositive: true, label: "vs last month" },
      status: { message: "Strong performance", context: "Exceeding targets by 15%" }
    },
    {
      title: "Active Users",
      value: 2350,
      description: "Current active users", 
      trend: { value: 8.2, isPositive: true, label: "vs last week" },
      status: { message: "Growing steadily", context: "User retention improving" }
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      description: "Lead to customer",
      trend: { value: 5.1, isPositive: false, label: "vs last month" },
      status: { message: "Needs attention", context: "Below industry average" }
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5",
      description: "Average rating",
      trend: { value: 2.3, isPositive: true, label: "vs last quarter" },
      status: { message: "Excellent feedback", context: "98% positive reviews" }
    }
  ];

  const sampleCampaigns = [
    {
      id: "1",
      name: "Welcome Series",
      status: "completed" as const,
      messageBody: "Welcome to our service! We're excited to have you on board. Here's what you can expect...",
      totalRecipients: 1250,
      sentCount: 1250,
      deliveredCount: 1198,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      name: "Product Launch",
      status: "draft" as const,
      messageBody: "🚀 Exciting news! Our new product is launching soon. Be the first to know about exclusive features.",
      totalRecipients: 850,
      sentCount: 0,
      deliveredCount: 0,
      createdAt: "2024-01-20T14:15:00Z"
    },
    {
      id: "3",
      name: "Holiday Promotion",
      status: "scheduled" as const,
      messageBody: "🎉 Special holiday offer just for you! Save 30% on all premium plans. Limited time only.",
      totalRecipients: 2100,
      sentCount: 0,
      deliveredCount: 0,
      scheduledAt: "2024-12-24T09:00:00Z",
      createdAt: "2024-01-18T16:45:00Z"
    }
  ];

  const sampleCustomers = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "5551234567",
      state: "CA",
      status: "active" as const,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "5559876543",
      state: "NY",
      status: "active" as const,
      createdAt: "2024-01-10T09:20:00Z"
    },
    {
      id: "3",
      firstName: "Mike", 
      lastName: "Davis",
      phone: "5556781234",
      state: "TX",
      status: "pending" as const,
      createdAt: "2024-01-22T16:45:00Z"
    }
  ];

  return (
    <div className="space-y-10 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Component Showcase</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Live demonstrations of all components in the DNwerks UI library. 
          See how they look and behave in real applications.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAnimated ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAnimated(!isAnimated)}
          >
            {isAnimated ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAnimated ? "Pause" : "Play"} Animations
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Component Demonstrations */}
      <Tabs defaultValue="metrics" className="space-y-10">
        <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-muted/30">
          <TabsTrigger value="metrics" className="font-semibold text-sm">Metric Cards</TabsTrigger>
          <TabsTrigger value="campaigns" className="font-semibold text-sm">Campaign Cards</TabsTrigger>
          <TabsTrigger value="customers" className="font-semibold text-sm">Customer Cards</TabsTrigger>
          <TabsTrigger value="charts" className="font-semibold text-sm">Charts</TabsTrigger>
          <TabsTrigger value="combined" className="font-semibold text-sm">Combined Demo</TabsTrigger>
        </TabsList>

        {/* Metric Cards Demo */}
        <TabsContent value="metrics" className="space-y-8 mt-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Metric Cards</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Responsive metric cards with trending indicators, gradient backgrounds, and container queries.
            </p>
          </div>
          
          <div className="space-y-6">
            <MetricCards metrics={sampleMetrics} />
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Responsive Design</h4>
                  <p className="text-muted-foreground">Container queries for typography scaling</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Trending Indicators</h4>
                  <p className="text-muted-foreground">Visual badges with trend direction</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Gradient Backgrounds</h4>
                  <p className="text-muted-foreground">Subtle gradients for visual depth</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Campaign Cards Demo */}
        <TabsContent value="campaigns" className="space-y-8 mt-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Campaign Cards</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Interactive campaign management cards with status tracking and action menus.
            </p>
          </div>
          
          <div className="space-y-6">
            <CampaignCards 
              campaigns={sampleCampaigns}
              onEdit={(campaign) => console.log("Edit:", campaign.name)}
              onDelete={(id) => console.log("Delete:", id)}
              onTest={(id) => console.log("Test:", id)}
              onSend={(id) => console.log("Send:", id)}
            />
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Status Types</h3>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-muted text-foreground">Draft</Badge>
                <Badge className="bg-campaign-pending text-campaign-pending-foreground">Scheduled</Badge>
                <Badge className="bg-campaign-warning text-campaign-warning-foreground">Sending</Badge>
                <Badge className="bg-campaign-success text-campaign-success-foreground">Completed</Badge>
                <Badge variant="destructive">Failed</Badge>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Cards Demo */}
        <TabsContent value="customers" className="space-y-8 mt-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Customer Cards</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Customer contact management with smart formatting and status indicators.
            </p>
          </div>
          
          <div className="space-y-6">
            <CustomerCards 
              customers={sampleCustomers}
              onEdit={(customer) => console.log("Edit:", customer.firstName)}
              onDelete={(id) => console.log("Delete:", id)}
              onContact={(customer) => console.log("Contact:", customer.firstName)}
            />
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Smart Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Phone Formatting</h4>
                  <p className="text-muted-foreground">Automatic US phone number formatting</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Date Intelligence</h4>
                  <p className="text-muted-foreground">Relative date display (Today, Yesterday, etc.)</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Detection</h4>
                  <p className="text-muted-foreground">Automatic contact method identification</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Demo */}
        <TabsContent value="charts" className="space-y-8 mt-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Chart Components</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Recharts-based visualization components with consistent theming.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Campaign Metrics (Line)</h3>
              <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Line Chart Preview</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Delivery Rates (Area)</h3>
              <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Area Chart Preview</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Engagement (Bar)</h3>
              <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Bar Chart Preview</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Cost Analysis (Composed)</h3>
              <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center space-y-2">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Composed Chart Preview</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Combined Demo */}
        <TabsContent value="combined" className="space-y-8 mt-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Complete Dashboard Demo</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              All components working together in a complete dashboard interface.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3 pb-4 border-b border-border/50">
              <h3 className="text-2xl font-bold tracking-tight">SMS Campaign Dashboard</h3>
              <p className="text-muted-foreground">Monitor your SMS campaign performance and customer engagement</p>
            </div>
            
            {/* Metrics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Key Metrics</h4>
              <MetricCards metrics={sampleMetrics} />
            </div>
            
            {/* Campaigns */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Active Campaigns</h4>
              <CampaignCards campaigns={sampleCampaigns.slice(0, 2)} />
            </div>
            
            {/* Customers */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Recent Customers</h4>
              <CustomerCards customers={sampleCustomers} />
            </div>
            
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Copy any component into your project and customize it to fit your needs.
                </p>
                <Button>
                  View Documentation
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}