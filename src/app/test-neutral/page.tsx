import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function TestNeutralPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="page-container section-spacing">
        {/* Header */}
        <Card className="mb-6">
          <div className="content-padding">
            <div className="header-spacing">
              <h1 className="text-4xl font-bold tracking-tight">Neutral Theme Test</h1>
              <p className="text-lg text-muted-foreground">
                Testing the neutral color scheme with enhanced design system
              </p>
            </div>
          </div>
        </Card>

        {/* Enhanced Pages Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="content-padding">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="form-label text-sm">Enhanced Demo</p>
                    <p className="text-lg font-bold">Complete Design System</p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  New
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                All enhanced components with neutral theme
              </p>
              <Link href="/enhanced-demo">
                <EnhancedButton size="sm" className="w-full">
                  View Enhanced Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </EnhancedButton>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="content-padding">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="form-label text-sm">Dashboard</p>
                    <p className="text-lg font-bold">Updated Design</p>
                  </div>
                </div>
                <Badge className="bg-campaign-success/10 text-campaign-success-foreground border-campaign-success/30">
                  Updated
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Dashboard with neutral theme applied
              </p>
              <Link href="/dashboard">
                <EnhancedButton variant="secondary" size="sm" className="w-full">
                  View Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </EnhancedButton>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="content-padding">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="form-label text-sm">Campaigns</p>
                    <p className="text-lg font-bold">Enhanced Layout</p>
                  </div>
                </div>
                <Badge className="bg-campaign-pending/10 text-campaign-pending-foreground border-campaign-pending/30">
                  Updated
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Campaigns page with improved design
              </p>
              <Link href="/campaigns">
                <EnhancedButton variant="outline" size="sm" className="w-full">
                  View Campaigns
                  <ArrowRight className="h-4 w-4 ml-2" />
                </EnhancedButton>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Theme Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="content-padding border-b border-border/20">
              <CardTitle className="text-xl font-bold">Neutral Theme Benefits</CardTitle>
            </CardHeader>
            <CardContent className="content-padding">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Professional Appearance</p>
                    <p className="text-sm text-muted-foreground">Clean, monochromatic design suitable for enterprise use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Better Content Focus</p>
                    <p className="text-sm text-muted-foreground">Neutral colors direct attention to functionality and data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Improved Accessibility</p>
                    <p className="text-sm text-muted-foreground">Better contrast ratios and WCAG compliance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Timeless Design</p>
                    <p className="text-sm text-muted-foreground">Neutral themes age well and remain professional</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="content-padding border-b border-border/20">
              <CardTitle className="text-xl font-bold">Enhanced Features</CardTitle>
            </CardHeader>
            <CardContent className="content-padding">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">24-32px Card Padding</p>
                    <p className="text-sm text-muted-foreground">Generous spacing for better content breathing room</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Enhanced Form Inputs</p>
                    <p className="text-sm text-muted-foreground">Better focus states, validation, and helper text</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Interactive Buttons</p>
                    <p className="text-sm text-muted-foreground">Loading states, scale effects, and proper touch targets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">400px Sidebar Width</p>
                    <p className="text-sm text-muted-foreground">Better layout balance and content visibility</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}