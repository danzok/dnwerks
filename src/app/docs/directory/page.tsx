import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Users, Download, GitBranch } from "lucide-react";

const communityComponents = [
  {
    name: "Advanced Data Tables",
    author: "shadcn-table-v2",
    description: "Enhanced data tables with advanced filtering, sorting, and pagination capabilities.",
    stars: 1240,
    downloads: "15.2k",
    category: "Data Display",
    tags: ["table", "pagination", "filtering", "sorting"],
    url: "https://github.com/shadcn-ui/table-v2"
  },
  {
    name: "Form Builder",
    author: "react-form-builder",
    description: "Drag-and-drop form builder with validation and conditional logic.",
    stars: 890,
    downloads: "8.7k", 
    category: "Forms",
    tags: ["forms", "validation", "builder", "drag-drop"],
    url: "https://github.com/shadcn-ui/form-builder"
  },
  {
    name: "Calendar Components",
    author: "shadcn-calendar-pro",
    description: "Advanced calendar and date picker components with events and scheduling.",
    stars: 1560,
    downloads: "22.1k",
    category: "Date & Time",
    tags: ["calendar", "datepicker", "events", "scheduling"],
    url: "https://github.com/shadcn-ui/calendar-pro"
  },
  {
    name: "Chart Library Extended",
    author: "charts-plus",
    description: "Extended chart library with more chart types and advanced customization.",
    stars: 675,
    downloads: "11.3k",
    category: "Charts",
    tags: ["charts", "visualization", "recharts", "d3"],
    url: "https://github.com/shadcn-ui/charts-plus"
  },
  {
    name: "E-commerce Components",
    author: "commerce-ui",
    description: "Complete e-commerce UI components including product cards, checkout flows, and shopping carts.",
    stars: 2100,
    downloads: "28.9k",
    category: "E-commerce",
    tags: ["ecommerce", "shopping", "checkout", "products"],
    url: "https://github.com/shadcn-ui/commerce-ui"
  },
  {
    name: "Dashboard Templates",
    author: "dashboard-templates",
    description: "Ready-to-use dashboard templates for admin panels and analytics.",
    stars: 1890,
    downloads: "19.4k",
    category: "Templates",
    tags: ["dashboard", "admin", "template", "analytics"],
    url: "https://github.com/shadcn-ui/dashboard-templates"
  }
];

export default function DirectoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-screen-2xl">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Registry Directory</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover community-maintained components, extensions, and templates built for shadcn/ui. 
          Contribute your own components and help grow the ecosystem.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">150+</div>
            <div className="text-sm text-muted-foreground">Community Components</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">45+</div>
            <div className="text-sm text-muted-foreground">Contributors</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">500k+</div>
            <div className="text-sm text-muted-foreground">Downloads</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">12+</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Community Components */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-2xl font-bold tracking-tight">Featured Community Components</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityComponents.map((component, index) => (
            <Card key={index} className="shadow-sm border border-border/50 hover:shadow-md transition-all duration-200 flex flex-col">
              <CardHeader className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold">{component.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {component.stars}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{component.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="h-3 w-3" />
                      {component.downloads}
                    </div>
                  </div>
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
                      +{component.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>by {component.author}</span>
                  </div>
                  
                  <Button asChild className="w-full">
                    <a href={component.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Component
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contributing Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Contribute to the Registry</CardTitle>
          <CardDescription className="text-base">
            Share your components with the community and help others build faster
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">
              <GitBranch className="h-4 w-4 mr-2" />
              Submit Component
            </Button>
            <Button variant="outline" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Guidelines
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            "Data Display", "Forms", "Navigation", "Feedback",
            "Charts", "E-commerce", "Templates", "Utilities",
            "Date & Time", "Media", "Layout", "Typography"
          ].map((category) => (
            <Card key={category} className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">{category}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.floor(Math.random() * 20) + 5} components
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}