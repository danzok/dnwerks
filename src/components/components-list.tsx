"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Check, ExternalLink, Download, Star } from "lucide-react";

interface ComponentItem {
  name: string;
  description: string;
  category: "dashboard" | "analytics" | "marketing" | "crm" | "charts" | "ui";
  tags: string[];
  registry: string;
  preview?: string;
  dependencies?: string[];
  featured?: boolean;
  installCommand: string;
}

const components: ComponentItem[] = [
  {
    name: "Analytics Dashboard",
    description: "Comprehensive analytics dashboard with metric cards, charts, and tables featuring responsive design and real-time data visualization.",
    category: "analytics",
    tags: ["dashboard", "metrics", "charts", "responsive"],
    registry: "analytics-dashboard-01",
    dependencies: ["recharts", "lucide-react"],
    featured: true,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Metric Cards",
    description: "Reusable metric cards with trending indicators, gradient backgrounds, and container queries for responsive typography.",
    category: "dashboard",
    tags: ["metrics", "cards", "responsive", "indicators"],
    registry: "metric-cards-01",
    dependencies: ["lucide-react"],
    featured: true,
    installCommand: "npx shadcn-ui@latest add metric-cards-01"
  },
  {
    name: "Campaign Cards",
    description: "Interactive campaign management cards with status tracking, progress indicators, and dropdown action menus.",
    category: "marketing",
    tags: ["campaigns", "status", "progress", "actions"],
    registry: "campaign-cards-01",
    dependencies: ["lucide-react"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add campaign-cards-01"
  },
  {
    name: "Customer Cards",
    description: "Customer contact management cards with status indicators, contact information display, and responsive grid layout.",
    category: "crm",
    tags: ["customers", "contacts", "status", "management"],
    registry: "customer-cards-01",
    dependencies: ["lucide-react"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add customer-cards-01"
  },
  {
    name: "Campaign Metrics Chart",
    description: "Line chart component specifically designed for campaign performance visualization with responsive design and custom theming.",
    category: "charts",
    tags: ["charts", "campaigns", "metrics", "visualization"],
    registry: "campaign-metrics-chart",
    dependencies: ["recharts"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Delivery Metrics Chart",
    description: "Area chart component for delivery rate tracking with percentage visualization and performance indicators.",
    category: "charts",
    tags: ["charts", "delivery", "rates", "performance"],
    registry: "delivery-metrics-chart",
    dependencies: ["recharts"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Customer Engagement Chart",
    description: "Bar chart component for visualizing customer engagement metrics with customizable styling and data formatting.",
    category: "charts",
    tags: ["charts", "engagement", "customers", "metrics"],
    registry: "customer-engagement-chart",
    dependencies: ["recharts"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Cost Analysis Chart",
    description: "Composed chart component combining line and area charts for comprehensive cost analysis visualization.",
    category: "charts",
    tags: ["charts", "costs", "analysis", "composite"],
    registry: "cost-analysis-chart",
    dependencies: ["recharts"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Analytics Table",
    description: "Reusable data table component with status badges, sorting capabilities, and responsive design for analytics data.",
    category: "analytics",
    tags: ["table", "data", "analytics", "sorting"],
    registry: "analytics-table",
    dependencies: ["lucide-react"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add analytics-dashboard-01"
  },
  {
    name: "Theme Showcase",
    description: "Complete theme demonstration component showing all available colors, styling patterns, and component variations.",
    category: "ui",
    tags: ["theme", "colors", "showcase", "patterns"],
    registry: "theme-showcase",
    dependencies: ["lucide-react"],
    featured: false,
    installCommand: "npx shadcn-ui@latest add theme-showcase"
  }
];

const categories = [
  { id: "all", label: "All Components", count: components.length },
  { id: "dashboard", label: "Dashboard", count: components.filter(c => c.category === "dashboard").length },
  { id: "analytics", label: "Analytics", count: components.filter(c => c.category === "analytics").length },
  { id: "marketing", label: "Marketing", count: components.filter(c => c.category === "marketing").length },
  { id: "crm", label: "CRM", count: components.filter(c => c.category === "crm").length },
  { id: "charts", label: "Charts", count: components.filter(c => c.category === "charts").length },
  { id: "ui", label: "UI", count: components.filter(c => c.category === "ui").length },
];

export function ComponentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || component.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredComponents = components.filter(c => c.featured);

  const copyToClipboard = async (text: string, registry: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(registry);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getCategoryBadgeColor = (category: ComponentItem["category"]) => {
    switch (category) {
      case "dashboard": return "bg-blue-50 text-blue-700 border-blue-200";
      case "analytics": return "bg-purple-50 text-purple-700 border-purple-200";
      case "marketing": return "bg-green-50 text-green-700 border-green-200";
      case "crm": return "bg-orange-50 text-orange-700 border-orange-200";
      case "charts": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "ui": return "bg-pink-50 text-pink-700 border-pink-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Component Library</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive collection of modern, reusable UI components built for shadcn/ui. 
          Perfect for dashboard and application interfaces.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-12 p-1">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="font-medium text-sm flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Featured Components */}
      {selectedCategory === "all" && !searchTerm && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold tracking-tight">Featured Components</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredComponents.map((component) => (
              <Card key={component.registry} className="shadow-sm border border-border/50 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold">{component.name}</CardTitle>
                        <Badge className={getCategoryBadgeColor(component.category)}>
                          {component.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {component.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {component.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-md p-2">
                      <code className="text-sm">{component.installCommand}</code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(component.installCommand, component.registry)}
                      className="shrink-0"
                    >
                      {copiedCommand === component.registry ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {component.dependencies && component.dependencies.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Dependencies:</span> {component.dependencies.join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Components */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedCategory === "all" ? "All Components" : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <div className="text-sm text-muted-foreground">
            {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {filteredComponents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No components found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card key={component.registry} className="shadow-sm border border-border/50 hover:shadow-md transition-all duration-200 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold">{component.name}</CardTitle>
                      {component.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <Badge className={getCategoryBadgeColor(component.category)}>
                      {component.category}
                    </Badge>
                    <CardDescription className="text-sm">
                      {component.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    {component.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {component.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{component.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-md p-2">
                        <code className="text-xs">{component.installCommand}</code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(component.installCommand, component.registry)}
                        className="shrink-0"
                      >
                        {copiedCommand === component.registry ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {component.dependencies && component.dependencies.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Dependencies:</span> {component.dependencies.join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Can't find what you need?</h3>
          <p className="text-muted-foreground">
            Try the{" "}
            <Button variant="link" className="h-auto p-0 text-primary">
              registry directory
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>{" "}
            for community-maintained components.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}