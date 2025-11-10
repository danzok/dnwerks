"use client";

import * as React from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedInput } from "@/components/ui/enhanced-input"
import { MessageComposer } from "@/components/ui/message-composer"
import { CampaignSummary, ExampleCampaignSummary } from "@/components/ui/campaign-summary"
import { RecipientsSelection, ExampleRecipientsSelection } from "@/components/ui/recipients-section"
import { SMSBestPractices } from "@/components/ui/sms-best-practices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Save, 
  Eye, 
  Calendar, 
  Users, 
  MessageSquare,
  Settings,
  Upload,
  Search,
  Phone,
  Mail
} from "lucide-react"

export default function EnhancedDemoPage() {
  const [messageValue, setMessageValue] = React.useState("Hi {firstName}, your order #{orderNumber} is ready for pickup!")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSendTest = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="page-container section-spacing">
        {/* Header */}
        <Card className="mb-6">
          <div className="content-padding">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="header-spacing">
                <h1 className="text-4xl font-bold tracking-tight">Enhanced Campaign Builder</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Create, customize, and send SMS campaigns with our improved interface design
                </p>
              </div>
              <div className="flex items-center gap-3">
                <EnhancedButton variant="outline" size="sm">
                  <Save className="h-4 w-4" />
                  Save Draft
                </EnhancedButton>
                <EnhancedButton size="sm">
                  <Eye className="h-4 w-4" />
                  Preview
                </EnhancedButton>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Details */}
            <Card>
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="content-padding space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Campaign Name"
                    placeholder="Enter campaign name..."
                    helper="Choose a descriptive name for internal tracking"
                  />
                  <EnhancedInput
                    label="Sender ID"
                    placeholder="YourBusiness"
                    helper="How recipients will see your name"
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    type="datetime-local"
                    label="Schedule Send Time"
                    helper="Leave empty to send immediately"
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <EnhancedInput
                    label="Reply Email"
                    type="email"
                    placeholder="support@yourbusiness.com"
                    helper="For customer replies and opt-outs"
                    icon={<Mail className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Message Composer */}
            <Card>
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  Message Content
                </CardTitle>
              </CardHeader>
              <CardContent className="content-padding">
                <MessageComposer
                  value={messageValue}
                  onChange={setMessageValue}
                  maxLength={160}
                  showPreview={true}
                />
              </CardContent>
            </Card>

            {/* Recipients Selection */}
            <ExampleRecipientsSelection />

            {/* SMS Best Practices */}
            <SMSBestPractices defaultExpanded={false} />

            {/* Form Validation Demo */}
            <Card>
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle>Form Validation Examples</CardTitle>
              </CardHeader>
              <CardContent className="content-padding space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Required Field"
                    placeholder="This field is required..."
                    error="This field cannot be empty"
                  />
                  <EnhancedInput
                    label="Password Field"
                    type="password"
                    placeholder="Enter your password..."
                    showPasswordToggle={true}
                    helper="Password must be at least 8 characters"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Search Field"
                    placeholder="Search campaigns..."
                    icon={<Search className="h-4 w-4" />}
                    iconPosition="left"
                  />
                  <EnhancedInput
                    label="Upload Field"
                    placeholder="Choose file..."
                    icon={<Upload className="h-4 w-4" />}
                    iconPosition="right"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Buttons Demo */}
            <Card>
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle>Button Variations</CardTitle>
              </CardHeader>
              <CardContent className="content-padding space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="form-label">Primary Actions</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <EnhancedButton
                        loading={isLoading}
                        onClick={handleSendTest}
                        icon={<Send className="h-4 w-4" />}
                      >
                        Send Test Message
                      </EnhancedButton>
                      <EnhancedButton variant="outline">
                        <Calendar className="h-4 w-4" />
                        Schedule Campaign
                      </EnhancedButton>
                      <EnhancedButton variant="secondary">
                        <Save className="h-4 w-4" />
                        Save Draft
                      </EnhancedButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="form-label">Button Sizes</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <EnhancedButton size="sm">Small Button</EnhancedButton>
                      <EnhancedButton size="default">Default Button</EnhancedButton>
                      <EnhancedButton size="lg">Large Button</EnhancedButton>
                      <EnhancedButton size="xl">Extra Large</EnhancedButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="form-label">Button States</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <EnhancedButton>Normal State</EnhancedButton>
                      <EnhancedButton disabled>Disabled State</EnhancedButton>
                      <EnhancedButton loading={true}>Loading State</EnhancedButton>
                      <EnhancedButton variant="destructive">
                        Delete Campaign
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Summary */}
            <ExampleCampaignSummary />

            {/* Quick Stats */}
            <Card className="card-elevated">
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="content-padding space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Balance</span>
                    <Badge variant="secondary">$247.82</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Messages Remaining</span>
                    <Badge variant="outline">12,394</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Campaigns</span>
                    <Badge className="bg-green-500/10 text-green-700">3</Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Monthly Usage</span>
                    <span>2,847 / 10,000</span>
                  </div>
                  <Progress value={28.47} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    71% remaining this billing cycle
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-elevated">
              <CardHeader className="content-padding border-b border-border/20">
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="content-padding">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Campaign "Welcome Series" completed</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">247 new contacts imported</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Low balance warning</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}