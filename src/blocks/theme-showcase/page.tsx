import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, MessageSquare, DollarSign, Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function ThemeShowcasePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Theme Showcase</h1>
        <p className="text-lg text-muted-foreground">
          Demonstrating SMS Campaign Dashboard theming with OKLCH colors and CSS variables
        </p>
      </div>

      {/* Color Palette Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status Colors</CardTitle>
            <CardDescription>Custom OKLCH campaign status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-campaign-success"></div>
                <span className="text-sm">Success / Completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-campaign-warning"></div>
                <span className="text-sm">Warning / Sending</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-campaign-pending"></div>
                <span className="text-sm">Pending / Scheduled</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-destructive"></div>
                <span className="text-sm">Failed / Error</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Rate Colors</CardTitle>
            <CardDescription>Performance-based color coding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-delivery-excellent"></div>
                <span className="text-sm">Excellent (95%+)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-delivery-good"></div>
                <span className="text-sm">Good (85-95%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-delivery-fair"></div>
                <span className="text-sm">Fair (75-85%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-delivery-poor"></div>
                <span className="text-sm">Poor (&lt;75%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart Colors</CardTitle>
            <CardDescription>OKLCH-based chart color palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: "var(--chart-1)"}}></div>
                <span className="text-sm">Chart Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: "var(--chart-2)"}}></div>
                <span className="text-sm">Chart Secondary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: "var(--chart-3)"}}></div>
                <span className="text-sm">Chart Tertiary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: "var(--chart-4)"}}></div>
                <span className="text-sm">Chart Quaternary</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Component Examples</h2>
        
        {/* Status Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Status Badges</h3>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-campaign-success text-campaign-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
            <Badge className="bg-campaign-pending text-campaign-pending-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
            <Badge className="bg-campaign-warning text-campaign-warning-foreground">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Sending
            </Badge>
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          </div>
        </div>

        {/* Metric Cards with Theming */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Themed Metric Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="@container/card flex flex-col metric-card-gradient">
              <CardHeader className="flex-1">
                <CardDescription>Campaign Success Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  94.2%
                </CardTitle>
                <CardAction>
                  <Badge className="bg-campaign-success text-campaign-success-foreground">
                    <TrendingUp className="w-3 h-3" />
                    +5.2%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Excellent performance <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Above industry average
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card flex flex-col metric-card-gradient">
              <CardHeader className="flex-1">
                <CardDescription>Pending Campaigns</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  12
                </CardTitle>
                <CardAction>
                  <Badge className="bg-campaign-pending text-campaign-pending-foreground">
                    <Clock className="w-3 h-3" />
                    Scheduled
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Ready to launch <Clock className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Next 24 hours
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card flex flex-col metric-card-gradient">
              <CardHeader className="flex-1">
                <CardDescription>Active Campaigns</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  5
                </CardTitle>
                <CardAction>
                  <Badge className="bg-campaign-warning text-campaign-warning-foreground">
                    <Activity className="w-3 h-3" />
                    Sending
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Currently processing <Activity className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  2,450 messages queued
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Buttons with Theme Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Themed Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-campaign-success hover:bg-campaign-success/90 text-campaign-success-foreground">
              Mark Complete
            </Button>
            <Button className="bg-campaign-warning hover:bg-campaign-warning/90 text-campaign-warning-foreground">
              Send Now
            </Button>
            <Button className="bg-campaign-pending hover:bg-campaign-pending/90 text-campaign-pending-foreground">
              Schedule
            </Button>
            <Button variant="destructive">
              Cancel Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Theme Information */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Information</CardTitle>
          <CardDescription>Technical details about the SMS Campaign Dashboard theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Color Format</h4>
              <p className="text-sm text-muted-foreground">
                Using OKLCH (Oklab + LCH) color space for better perceptual uniformity and accessibility.
              </p>
              <code className="text-xs bg-muted p-2 rounded block">
                --campaign-success: oklch(0.7 0.15 155);
              </code>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">CSS Variables</h4>
              <p className="text-sm text-muted-foreground">
                Custom campaign-specific variables with automatic dark mode adaptation.
              </p>
              <code className="text-xs bg-muted p-2 rounded block">
                className="bg-campaign-success"
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}